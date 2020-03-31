from setuptools import find_namespace_packages, setup
setup(
    name="libal",
    version="1.0",
    description="Package containing all alphien functions",
    url="www.alphien.com",
    author="alphien",
    author_email="info@alphien.com",
    packages=find_namespace_packages() # Follows similar lookup as find_packages()
)