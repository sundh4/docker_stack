# Ubuntu 16.04 xenial
# https://github.com/tianon/docker-brew-ubuntu-core/commit/d4313e13366d24a97bd178db4450f63e221803f1
ARG BASE_CONTAINER=ubuntu:xenial@sha256:b1c268ca7c73556456ffc3318eb2a8e7ac6ad257ef5788d50dc1db4a3e3bd2ac
FROM $BASE_CONTAINER

LABEL maintainer="Surya<surya@omitsindo.com>"
ARG NB_USER="sundh4"
ARG NB_UID="1000"
ARG NB_GID="100"
ARG JAVA_HOME="/usr/lib/jvm/java-8-openjdk-amd64"
ARG LD_LIBRARY_PATH="/opt/conda/lib:/opt/conda/lib64:/usr/lib:lib$"

USER root

# Install all OS dependencies for notebook server that starts but lacks all
# features (e.g., download as all possible file formats)
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && \
	apt-get install -yq --no-install-recommends \
	build-essential \
	apt-utils \
	tzdata \
    unzip \
    nano \
    wget \
    bzip2 \
    ca-certificates \
    sudo \
    locales \
    fonts-liberation \
    run-one \
    lsb-release \
    openjdk-8-jdk \
    curl \
    && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
    
RUN apt-get update && apt-get install -yq --no-install-recommends \
    jed \
    libsm6 \
    libxext-dev \
    libxrender1 \
    lmodern \
    netcat \
    pandoc \
    texlive-fonts-extra \
    texlive-fonts-recommended \
    texlive-generic-recommended \
    texlive-generic-extra \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-xetex \
    && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
    
# For libzmq dev
RUN echo 'deb http://download.opensuse.org/repositories/network:/messaging:/zeromq:/release-stable/xUbuntu_16.04/ /' > /etc/apt/sources.list.d/network:messaging:zeromq:release-stable.list && \
	wget -nv https://download.opensuse.org/repositories/network:messaging:zeromq:release-stable/xUbuntu_16.04/Release.key -O Release.key && \
	apt-key add - < Release.key && \
	rm -fv Release.key && \
	apt-get update && \
	apt-get install -y libzmq3-dev \
    && \
    apt-get autoremove -y && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
    locale-gen

# Configure environment
ENV CONDA_DIR=/opt/conda \
    SHELL=/bin/bash \
    NB_USER=$NB_USER \
    NB_UID=$NB_UID \
    NB_GID=$NB_GID \
    LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US.UTF-8
ENV PATH=$CONDA_DIR/bin:$PATH \
    HOME=/home/$NB_USER \
    JAVA_HOME=$JAVA_HOME \
    JRE_HOME=$JAVA_HOME/jre \
    LD_LIBRARY_PATH=/usr/lib/jvm/java-8-openjdk-amd64/jre/lib/amd64/server:$LD_LIBRARY_PATH

# Add a script that we will use to correct permissions after running certain commands
ADD utils/script/fix-permissions /usr/local/bin/fix-permissions
RUN chmod a+rx /usr/local/bin/fix-permissions

# Enable prompt color in the skeleton .bashrc before creating the default NB_USER
RUN sed -i 's/^#force_color_prompt=yes/force_color_prompt=yes/' /etc/skel/.bashrc

# Create NB_USER wtih name sundh4 user with UID=1000 and in the 'users' group
# and make sure these dirs are writable by the `users` group.
RUN echo "auth requisite pam_deny.so" >> /etc/pam.d/su && \
    sed -i.bak -e 's/^%admin/#%admin/' /etc/sudoers && \
    sed -i.bak -e 's/^%sudo/#%sudo/' /etc/sudoers && \
    useradd -m -s /bin/bash -N -u $NB_UID $NB_USER && \
    mkdir -p $CONDA_DIR && \
    chown $NB_USER:$NB_GID $CONDA_DIR && \
    chmod g+w /etc/passwd && \
    fix-permissions $HOME && \
    fix-permissions "$(dirname $CONDA_DIR)"

USER $NB_UID
WORKDIR $HOME
ARG PYTHON_VERSION=3.6.7

# Setup work directory for backward-compatibility
RUN mkdir -p /home/$NB_USER/work && \
	mkdir -p /home/$NB_USER/.conda && \
	fix-permissions /home/$NB_USER

# Install conda as sundh4 and check the md5 sum provided on the download site
ENV MINICONDA_VERSION=4.7.10 \
    MINICONDA_MD5=1c945f2b3335c7b2b15130b1b2dc5cf4 \
    CONDA_VERSION=4.7.12

RUN cd /tmp && \
    wget --quiet https://repo.continuum.io/miniconda/Miniconda3-${MINICONDA_VERSION}-Linux-x86_64.sh && \
    echo "${MINICONDA_MD5} *Miniconda3-${MINICONDA_VERSION}-Linux-x86_64.sh" | md5sum -c - && \
    /bin/bash Miniconda3-${MINICONDA_VERSION}-Linux-x86_64.sh -f -b -p $CONDA_DIR && \
    rm Miniconda3-${MINICONDA_VERSION}-Linux-x86_64.sh && \
    echo "conda ${CONDA_VERSION}" >> $CONDA_DIR/conda-meta/pinned && \
    $CONDA_DIR/bin/conda config --system --prepend channels conda-forge && \
    $CONDA_DIR/bin/conda config --system --set auto_update_conda false && \
    $CONDA_DIR/bin/conda config --system --set show_channel_urls true && \
    conda install --yes python=$PYTHON_VERSION && \
    conda list python | grep '^python ' | tr -s ' ' | cut -d '.' -f 1,2 | sed 's/$/.*/' >> $CONDA_DIR/conda-meta/pinned && \
    $CONDA_DIR/bin/conda install --quiet --yes conda && \
    conda clean --all -f -y && \
    rm -rf /home/$NB_USER/.cache/yarn && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

# Install Tini
RUN conda install --quiet --yes 'tini=0.18.0' && \
    conda list tini | grep tini | tr -s ' ' | cut -d ' ' -f 1,2 >> $CONDA_DIR/conda-meta/pinned && \
    conda clean --all -f -y && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

# Install Jupyter Notebook, Lab, and Hub
# Generate a notebook server config
# Cleanup temporary files
# Correct permissions
# Do all this in a single RUN command to avoid duplicating all of the
# files across image layers when the permissions change
RUN conda install --quiet --yes \
    'notebook=6.0.2' \
    'jupyterhub=1.0.0' \
	'jupyterlab=1.2.4' \
    'jupyter_client=5.3.4' \
    'ipython=7.10.2' && \
    conda clean --all -f -y && \
    npm cache clean --force && \
    jupyter notebook --generate-config && \
    rm -rf /home/$NB_USER/.cache/yarn && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

# Utils
RUN conda install -c conda-forge --quiet --yes \
	'prompt_toolkit=2.0.4' \
	'ipywidgets=7.5.1' && \
	rm -rf $CONDA_DIR/share/jupyter/lab/staging && \
    fix-permissions $CONDA_DIR
# nbresuse extensions for memory usage status
RUN mkdir -p $HOME/.cache && \
	python -m pip install nbresuse && \
	rm -rf $HOME/.cache/* && \
	fix-permissions $HOME    
# pyzmq
RUN mkdir -p $HOME/.cache && \
	python -m pip install 'pyzmq==18.0.2' && \
	rm -rf $HOME/.cache/* && \
	fix-permissions $HOME

# Additional ubuntu packages
USER root
RUN apt-get update && \
	apt-get install -yq --no-install-recommends \
	enscript \
	tdsodbc unixodbc unixodbc-dev \
	latex2html graphviz imagemagick pdftk \
	ldap-utils \
	&& \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN wget --quiet -O /tmp/maodbc.tar.gz \
	'https://downloads.mariadb.com/Connectors/odbc/connector-odbc-3.1.5/mariadb-connector-odbc-3.1.5-ga-debian-x86_64.tar.gz' && \
	mkdir -p /tmp/maodbc && \
	tar -xzf /tmp/maodbc.tar.gz -C /tmp/maodbc && \
	cp -v /tmp/maodbc/lib/libmaodbc.so /usr/local/lib/libmaodbc.so
	
# Machine learning packages
RUN conda install -c anaconda --quiet --yes \
	'keras=2.2.4' \
	'tensorflow=1.15.0' \
	'pandas=0.25.3' \
	'scikit-learn=0.22.1'
RUN conda install -c conda-forge --quiet --yes \
	'matplotlib=3.1.0' \
	&& \
	conda clean --all -f -y && \
    fix-permissions $CONDA_DIR

# Patching file manager notebook so broken symlink will works.
RUN sed -i 's#st = os.lstat(os_path)#st = os.stat(os_path)#g' \
	/opt/conda/lib/python3.6/site-packages/notebook/services/contents/filemanager.py


USER $NB_UID
EXPOSE 8888

# Configure container startup
ENTRYPOINT ["tini", "-g", "--"]
CMD ["start-notebook.sh"]

# Add local files as late as possible to avoid cache busting
COPY utils/script/start.sh /usr/local/bin/
COPY utils/script/start-notebook.sh /usr/local/bin/
COPY utils/script/start-singleuser.sh /usr/local/bin/
COPY utils/config/jupyter_notebook_config.py /etc/jupyter/
COPY utils/config/odbcinst.ini /etc/

# Fix permissions on /etc/jupyter as root
USER root
RUN fix-permissions /etc/jupyter/

# Switch back to sundh4 to avoid accidental container runs as root
USER $NB_UID
