import json
import os
import re
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any

class VerificationProvider(ABC):
    @property
    @abstractmethod
    def source_name(self) -> str:
        """Returns the human-readable source name for transparency."""
        pass

    @abstractmethod
    def get_trusted_organization(self, org_name: str) -> Optional[Dict[str, Any]]:
        """Returns organization record if found in registry, else None."""
        pass

    @abstractmethod
    def get_official_domains(self, org_name: str) -> List[str]:
        """Returns official domains for organization."""
        pass

    @abstractmethod
    def get_official_phones(self, org_name: str) -> List[str]:
        """Returns official phone numbers for organization."""
        pass


class DemoRegistryProvider(VerificationProvider):
    def __init__(self, json_path: Optional[str] = None):
        self._source_name = "Demo trusted organization registry"
        if json_path is None:
            # Default to backend/app/data/trusted_organizations.json
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            json_path = os.path.join(base_dir, "data", "trusted_organizations.json")
        
        self.registry: Dict[str, Any] = {}
        if os.path.exists(json_path):
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    self.registry = json.load(f)
            except Exception:
                self._load_fallback()
        else:
            self._load_fallback()

    def _load_fallback(self):
        self.registry = {
            "Northstar Financial": {
                "official_domains": ["northstar.example"],
                "official_phones": ["+9118009876543", "+91 1800 987 6543"]
            },
            "Acme Delivery": {
                "official_domains": ["acme-delivery.example"],
                "official_phones": ["+9118001112222", "+91 1800 111 2222"]
            }
        }

    @property
    def source_name(self) -> str:
        return self._source_name

    def get_trusted_organization(self, org_name: str) -> Optional[Dict[str, Any]]:
        if not org_name:
            return None
        
        clean_target = org_name.strip().lower()
        
        # Exact case-insensitive match
        for name, data in self.registry.items():
            if name.lower() == clean_target:
                return {"name": name, **data}
                
        # Substring / partial match (e.g. "Your Northstar Financial" -> "Northstar Financial")
        for name, data in self.registry.items():
            if name.lower() in clean_target or clean_target in name.lower():
                return {"name": name, **data}

        return None

    def get_official_domains(self, org_name: str) -> List[str]:
        org = self.get_trusted_organization(org_name)
        return org.get("official_domains", []) if org else []

    def get_official_phones(self, org_name: str) -> List[str]:
        org = self.get_trusted_organization(org_name)
        return org.get("official_phones", []) if org else []
