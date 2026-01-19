__all__ = ["blueprints"]

import importlib
import pkgutil

__path__ = pkgutil.extend_path(__path__, __name__)

blueprints = []

for loader, module_name, is_package in pkgutil.walk_packages(__path__):
    full_module_name = f"{__name__}.{module_name}"
    module = importlib.import_module(full_module_name)

    if hasattr(module, "blueprint"):
        blueprints.append(module.blueprint)
