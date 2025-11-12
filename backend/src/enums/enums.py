from enum import Enum


class Province(str, Enum):
    """Enum for province and territory abbreviations"""
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
