#ARG BASE_CONTAINER=sundh4/base_notebook:latest@sha256:7921257da10e259ec9ba371b28303bec5fffaf02a88e7af2fc5d883c3e011ef6
ARG BASE_CONTAINER=sundh4/base_notebook:latest
FROM $BASE_CONTAINER

### Block for Setup R Kernel ####
USER root

# Remove repository list
RUN rm /etc/apt/sources.list.d/*

# R pre-requisites
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    software-properties-common \
    fonts-dejavu \
    gfortran \
    gcc \
    libgit2-dev \
    libssh2-1-dev \
    libssl-dev \
    libfontconfig1-dev \
    libcairo2-dev \
    && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Fix for devtools https://github.com/conda-forge/r-devtools-feedstock/issues/4
RUN ln -s /bin/tar /bin/gtar

RUN conda install -c anaconda --quiet --yes \
    qtconsole \
    jupyter_console \
    && \
    conda clean --all -f -y \
    && \
    fix-permissions $CONDA_DIR

# R Base core
RUN apt-add-repository "deb http://cran.rstudio.com/bin/linux/ubuntu $(lsb_release -cs)/" && \
    gpg --keyserver keyserver.ubuntu.com --recv-key E084DAB9 && \
    gpg -a --export E084DAB9 | sudo apt-key add - && \
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E298A3A825C0D65DFD57CBB651716619E084DAB9 && \
    apt-get update && \
    apt-get install -y r-base-core=3.4.3-1xenial0 r-base-dev=3.4.3-1xenial0 && \
    apt-get autoremove && apt-get clean && rm -rf /var/lib/apt/lists/*

# Env for R_HOME
ENV R_HOME=/usr/lib/R

# Enable sourcing qlib
COPY utils/R/Renviron /etc/R/
COPY utils/R/Rprofile.site /etc/R/

ADD utils/R/ir /opt/conda/share/jupyter/kernels/ir
ADD utils/R/IRkernel /usr/lib/R/library/IRkernel
### End Block for Setup R Kernel ####

# Modification on Kernel, notebook, logo and extensions
ADD utils/R/menu_stack /etc/jupyter/menu_stack
RUN jupyter nbextension install /etc/jupyter/menu_stack --system --log-level='ERROR' && \
	jupyter nbextension enable menu_stack/main --system && \
	chmod -R 755 /usr/local/share/jupyter/nbextensions/menu_stack/ && \
	rm /etc/jupyter/menu_stack -rf
COPY utils/al.png /opt/conda/share/jupyterhub/static/images/jupyter.png
RUN fix-permissions /opt/conda/share/jupyterhub/ && \
	chmod 660 /opt/conda/share/jupyterhub/static/images/jupyter.png
RUN jupyter labextension install jupyterlab-cpustatus


# TA-Lib
WORKDIR /tmp
RUN wget -q https://github.com/sundh4/ta-lib-aws-lambda/releases/download/0.4.0/ta-lib-0.4.0-src.tar.gz && \
	tar -xzf ta-lib-0.4.0-src.tar.gz && \
	cd ta-lib && \
	echo "Installing TA-Lib......" && ./configure --prefix=/usr >/dev/null 2>&1 && \
	make >/dev/null 2>&1 && echo "Compiling TA-Lib Success" || echo "Compiling Failed" && \
	make install >/dev/null 2>&1 && echo "TA-Lib installed!" || echo "Failed to install TA-Lib"
RUN wget -q https://github.com/sundh4/ta-lib-aws-lambda/archive/0.4.0.tar.gz && \
	tar -xzf 0.4.0.tar.gz && \
	cp -r ta-lib-aws-lambda-0.4.0/talib/ /opt/conda/lib/python3.6/site-packages/

# Plotly
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN conda install --quiet --yes -c plotly plotly=4.5.0 && \
	jupyter labextension install @jupyter-widgets/jupyterlab-manager@1.1 --no-build && \
	jupyter labextension install jupyterlab-plotly@1.5.0 --no-build --log-level='ERROR' && \
	jupyter labextension install plotlywidget@1.5.0 --no-build --log-level='ERROR' && \
	jupyter lab build --log-level='ERROR'
ENV NODE_OPTIONS=''

# Add more python lib
RUN python -m pip install \
	'seaborn==0.10.0'

# Fixing Python Permissions
RUN echo "Fixing Python permission....." && \
	chown -R root:users /opt/conda/lib/python3.6/site-packages/
	
# Setup python AL libs
ADD utils/Py/PythonAl /tmp/PythonAl
WORKDIR /tmp/PythonAl
RUN python -m pip install . && \
	chown -R root:users /opt/conda/lib/python3.6/site-packages/libal/
WORKDIR $HOME
# Cleaning temporary folder
RUN rm -rf /tmp/*

# Switch back to sundh4 to avoid accidental container runs as root
USER $NB_UID
