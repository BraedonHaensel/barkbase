from enum import Enum


class AccountType(str, Enum):
    """Enum for user account types."""
    OWNER = "owner"
    SERVICE_PROVIDER = "service_provider"

    def __str__(self) -> str:
        return self.value


class ServiceType(str, Enum):
    """Enum for booking service types."""
    WALKING = "walking"
    SITTING = "sitting"

    def __str__(self) -> str:
        return self.value


class Province(str, Enum):
    """Enum for province and territory abbreviations."""
    AB = "AB"
    BC = "BC"
    MB = "MB"
    NB = "NB"
    NL = "NL"
    NT = "NT"
    NS = "NS"
    NU = "NU"
    ON = "ON"
    PE = "PE"
    QC = "QC"
    SK = "SK"
    YT = "YT"

    def __str__(self) -> str:
        return self.value
