from __future__ import annotations

__all__ = ["blueprints"]

import importlib
import logging
import os
import pkgutil
from typing import TYPE_CHECKING

import yaml

if TYPE_CHECKING:
    from quart import Blueprint

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

__path__ = pkgutil.extend_path(__path__, __name__)

blueprints: list[Blueprint] = []

for loader, module_name, is_package in pkgutil.walk_packages(__path__):
    full_module_name = f"{__name__}.{module_name}"
    module = importlib.import_module(full_module_name)

    if hasattr(module, "blueprint"):
        blueprints.append(module.blueprint)


class BlueprintYAMLChecker:
    YAML_FILENAME = "blueprint-config.yaml"

    @staticmethod
    def main() -> None:
        BlueprintYAMLChecker.check_yaml_integration()
        BlueprintYAMLChecker.apply_yaml_config()

    @staticmethod
    def check_yaml_integration() -> None:
        if not os.path.exists(BlueprintYAMLChecker.YAML_FILENAME):
            msg = (
                "It seems like BlueprintYAMLChecker is your first time running Foxterm!"
            )
            logger.warning(msg)
            BlueprintYAMLChecker.write_yaml_config()
            return

        with open(BlueprintYAMLChecker.YAML_FILENAME) as stream:
            data: dict = yaml.safe_load(stream)

        if (
            data is None
            or data.get("enabled") is None
            or data["enabled"].keys()
            != BlueprintYAMLChecker.generate_yaml_config()["enabled"].keys()
        ):
            msg = f"Your {BlueprintYAMLChecker.YAML_FILENAME} file is out of date!"
            logger.warning(msg)
            BlueprintYAMLChecker.write_yaml_config()

    @staticmethod
    def generate_yaml_config() -> dict:
        return {
            "enabled": dict.fromkeys([blueprint.name for blueprint in blueprints], True)
        }

    @staticmethod
    def write_yaml_config() -> None:
        msg = f"Writing {BlueprintYAMLChecker.YAML_FILENAME}..."
        logger.warning(msg)

        with open(BlueprintYAMLChecker.YAML_FILENAME, "w+") as stream:
            yaml.safe_dump(BlueprintYAMLChecker.generate_yaml_config(), stream)

    @staticmethod
    def apply_yaml_config() -> None:
        global blueprints
        with open(BlueprintYAMLChecker.YAML_FILENAME) as stream:
            data: dict = yaml.safe_load(stream)

        blueprints = [
            blueprint
            for (blueprint, enabled) in zip(blueprints, data["enabled"].values())
            if enabled
        ]


BlueprintYAMLChecker.main()
