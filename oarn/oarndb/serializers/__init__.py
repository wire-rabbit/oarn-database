# The OARN Relief Nursery Database
# Copyright (C) 2015  Oregon Association of Relief Nurseries
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from oarndb.serializers.base_serializer import BaseSerializer

# Reference Serializers:
from oarndb.serializers.reference_serializers import RefAdultChildRelationshipTypeSerializer
from oarndb.serializers.reference_serializers import RefLanguageSerializer
from oarndb.serializers.reference_serializers import RefLanguageUseTypeSerializer
from oarndb.serializers.reference_serializers import RefAdultFamilyRelationshipTypeSerializer
from oarndb.serializers.reference_serializers import RefChildFamilyRelationshipTypeSerializer
from oarndb.serializers.reference_serializers import RefRaceSerializer
from oarndb.serializers.reference_serializers import RefGenderSerializer
from oarndb.serializers.reference_serializers import RefPersonTelephoneNumberTypeSerializer
from oarndb.serializers.reference_serializers import RefEmailTypeSerializer
from oarndb.serializers.reference_serializers import RefCountySerializer
from oarndb.serializers.reference_serializers import RefStateSerializer
from oarndb.serializers.reference_serializers import RefLocationTypeSerializer
from oarndb.serializers.reference_serializers import RefRoleSerializer
from oarndb.serializers.reference_serializers import RefContactTypeSerializer
from oarndb.serializers.reference_serializers import RefProgramSerializer
from oarndb.serializers.reference_serializers import RefServiceLevelSerializer
from oarndb.serializers.reference_serializers import RefAssessmentIntervalTypeSerializer
from oarndb.serializers.reference_serializers import RefAttendanceStatusSerializer
from oarndb.serializers.reference_serializers import RefTransportTypeSerializer
from oarndb.serializers.reference_serializers import RefHomeVisitLocationSerializer
from oarndb.serializers.reference_serializers import RefReferredFromSerializer
from oarndb.serializers.reference_serializers import RefWaitlistStatusSerializer
from oarndb.serializers.reference_serializers import RefServiceNeedSerializer

# Nested Serializers:
from oarndb.serializers.nested_serializers import NestedPersonSerializer
from oarndb.serializers.nested_serializers import NestedChildSerializer
from oarndb.serializers.nested_serializers import NestedAdultSerializer
from oarndb.serializers.nested_serializers import NestedChildFamilyRelationshipSerializer
from oarndb.serializers.nested_serializers import NestedAdultFamilyRelationshipSerializer
from oarndb.serializers.nested_serializers import NestedOrganizationSerializer
from oarndb.serializers.nested_serializers import NestedOrganizationPersonRoleSerializer
from oarndb.serializers.nested_serializers import NestedRefRoleSerializer
from oarndb.serializers.nested_serializers import NestedPersonEnrollmentSerializer
from oarndb.serializers.nested_serializers import NestedRefProgramSerializer
from oarndb.serializers.nested_serializers import NestedRefServiceLevelSerializer
from oarndb.serializers.nested_serializers import NestedServiceLevelEnrollmentSerializer

# Family Serializers:
from oarndb.serializers.person_serializers import PersonListSerializer, PersonDetailSerializer, PersonCreateSerializer
from oarndb.serializers.person_serializers import AdultSerializer, ChildSerializer
from oarndb.serializers.family_serializers import FamilyCreateSerializer, AdultListSerializer, ChildListSerializer
from oarndb.serializers.family_serializers import FamilyAddressListSerializer, FamilyAddressModelSerializer
from oarndb.serializers.family_serializers import FamilyAddressCreateSerializer, FamilyNotesSerializer
from oarndb.serializers.family_serializers import PersonRaceSerializer, PersonLanguageSerializer
from oarndb.serializers.family_serializers import PersonTelephoneSerializer
from oarndb.serializers.family_serializers import PersonEmailAddressSerializer
from oarndb.serializers.family_serializers import AdultFamilyRelationshipSerializer, ChildFamilyRelationshipSerializer

# Org Serializers
from oarndb.serializers.org_serializers import StaffListSerializer
from oarndb.serializers.org_serializers import OrganizationLocationSerializer

# Program Serializers:
from oarndb.serializers.program_serializers import CaseManagerSerializer, CaseManagerCreateSerializer
from oarndb.serializers.program_serializers import CaseManagerModelSerializer
from oarndb.serializers.program_serializers import FamilyEnrollmentSerializer
from oarndb.serializers.program_serializers import PersonEnrollmentSerializer
from oarndb.serializers.program_serializers import ServiceLevelEnrollmentSerializer
from oarndb.serializers.program_serializers import FamilyEnrollmentReadOnlySerializer
from oarndb.serializers.waitlist_serializers import WaitlistSerializer

# Home Visit Serializers:
from oarndb.serializers.home_visit_serializers import HomeVisitSerializer
from oarndb.serializers.home_visit_serializers import ContactLogSerializer

# Assessment Serializers:
from oarndb.serializers.assessment_serializers import FamilyAssessmentSerializer
from oarndb.serializers.assessment_serializers import ChildAssessmentSerializer
from oarndb.serializers.assessment_serializers import RiskFactorAssessmentSerializer
from oarndb.serializers.assessment_serializers import ASQSerializer
from oarndb.serializers.assessment_serializers import ASQSESerializer
from oarndb.serializers.assessment_serializers import RefAssessmentIntervalSerializer
from oarndb.serializers.assessment_serializers import RefMaritalStatusSerializer
from oarndb.serializers.assessment_serializers import RefEmploymentSerializer
from oarndb.serializers.assessment_serializers import RefGrossMonthlyIncomeSerializer
from oarndb.serializers.assessment_serializers import RefSizeOfFamilySerializer
from oarndb.serializers.assessment_serializers import RefEmergencyServicesSerializer
from oarndb.serializers.assessment_serializers import RefFrequencyScaleSerializer
from oarndb.serializers.assessment_serializers import RefReadingFrequencySerializer
from oarndb.serializers.assessment_serializers import RefStrengthsScaleSerializer
from oarndb.serializers.assessment_serializers import RefSmokeExposureScaleSerializer
from oarndb.serializers.assessment_serializers import RefQualityScaleSerializer
from oarndb.serializers.assessment_serializers import RefFrequencyScaleTwoSerializer
from oarndb.serializers.assessment_serializers import RefYesNoDkSerializer
from oarndb.serializers.assessment_serializers import RefAsqScreeningAgeSerializer
from oarndb.serializers.assessment_serializers import RefAsqseScreeningAgeSerializer
from oarndb.serializers.assessment_serializers import RefAsqseDevStatusSerializer
from oarndb.serializers.assessment_serializers import RefImmunizationStatusSerializer
from oarndb.serializers.assessment_serializers import RefChildHeightSerializer
from oarndb.serializers.assessment_serializers import RefChildWeightSerializer
from oarndb.serializers.assessment_serializers import RefPrenatalCareSerializer
from oarndb.serializers.assessment_serializers import RefASQIntervalSerializer
from oarndb.serializers.assessment_serializers import RefASQSEIntervalSerializer

# Procedural Serializers:
from oarndb.serializers.proc_serializers import AdultSearchSerializer, ChildSearchSerializer
from oarndb.serializers.family_serializers import FamilyListSerializer
from oarndb.serializers.proc_serializers import OrganizationAccessSerializer

# Attendance Serializers
from oarndb.serializers.attendance_serializers import ClassroomSerializer
from oarndb.serializers.attendance_serializers import ClassScheduleSerializer
from oarndb.serializers.attendance_serializers import PersonClassScheduleSerializer
from oarndb.serializers.attendance_serializers import PersonAttendanceSerializer
from oarndb.serializers.attendance_serializers import CreateAttendanceRecordsSerializer

__all__ = [
    # Reference Tables:
    'BaseSerializer',
    'RefAdultChildRelationshipTypeSerializer',
    'RefLanguageSerializer',
    'RefLanguageUseTypeSerializer',
    'RefAdultFamilyRelationshipTypeSerializer',
    'RefChildFamilyRelationshipTypeSerializer',
    'RefRaceSerializer',
    'RefGenderSerializer',
    'RefPersonTelephoneNumberTypeSerializer',
    'RefEmailTypeSerializer',
    'RefCountySerializer',
    'RefStateSerializer',
    'RefLocationTypeSerializer',
    'RefRoleSerializer',
    'RefContactTypeSerializer',
    'RefProgramSerializer',
    'RefServiceLevelSerializer',
    'RefAssessmentIntervalTypeSerializer',
    'RefAttendanceStatusSerializer',
    'RefTransportTypeSerializer',
    'RefHomeVisitLocationSerializer',
    'RefReferredFromSerializer',
    'RefWaitlistStatusSerializer',
    'RefServiceNeedSerializer',
    # Nested Serializers:
    'NestedPersonSerializer',
    'NestedChildSerializer',
    'NestedAdultSerializer',
    'NestedChildFamilyRelationshipSerializer',
    'NestedAdultFamilyRelationshipSerializer',
    'NestedOrganizationSerializer'
    'NestedOrganizationPersonRoleSerializer',
    'NestedPersonEnrollmentSerializer',
    'NestedRefProgramSerializer',
    'NestedRefServiceLevelSerializer',
    'NestedServiceLevelEnrollmentSerializer',
    # Family Serializers:
    'PersonListSerializer',
    'PersonDetailSerializer',
    'PersonCreateSerializer',
    'AdultSerializer',
    'ChildSerializer',
    'FamilyListSerializer',
    'FamilyCreateSerializer',
    'ChildListSerializer',
    'AdultListSerializer',
    'FamilyAddressListSerializer',
    'FamilyAddressModelSerializer',
    'FamilyAddressCreateSerializer',
    'FamilyNotesSerializer',
    'PersonRaceSerializer',
    'PersonLanguageSerializer',
    'PersonTelephoneSerializer',
    'PersonEmailAddressSerializer',
    'AdultFamilyRelationshipSerializer',
    'ChildFamilyRelationshipSerializer',
    # Org Serializers:
    'StaffListSerializer',
    'OrganizationLocationSerializer',
    # Program Serializers:
    'CaseManagerSerializer',
    'CaseManagerCreateSerializer',
    'CaseManagerModelSerializer',
    'FamilyEnrollmentSerializer',
    'PersonEnrollmentSerializer',
    'ServiceLevelEnrollmentSerializer',
    'FamilyEnrollmentReadOnlySerializer',
    'WaitlistSerializer',
    # Home Visit Serializers:
    'HomeVisitSerializer',
    'ContactLogSerializer',
    # Assessment Serializers:
    'FamilyAssessmentSerializer',
    'ChildAssessmentSerializer',
    'RiskFactorAssessmentSerializer',
    'ASQSerializer',
    'ASQSESerializer',
    'RefAssessmentIntervalSerializer',
    'RefMaritalStatusSerializer',
    'RefEmploymentSerializer',
    'RefGrossMonthlyIncomeSerializer',
    'RefSizeOfFamilySerializer',
    'RefEmergencyServicesSerializer',
    'RefFrequencyScaleSerializer',
    'RefReadingFrequencySerializer',
    'RefStrengthsScaleSerializer',
    'RefSmokeExposureScaleSerializer',
    'RefQualityScaleSerializer',
    'RefFrequencyScaleTwoSerializer',
    'RefYesNoDkSerializer',
    'RefAsqScreeningAgeSerializer',
    'RefAsqseScreeningAgeSerializer',
    'RefAsqseDevStatusSerializer',
    'RefImmunizationStatusSerializer',
    'RefChildHeightSerializer',
    'RefChildWeightSerializer',
    'RefPrenatalCareSerializer',
    'RefASQIntervalSerializer',
    'RefASQSEIntervalSerializer',
    # Procedural Serializers
    'AdultSearchSerializer',
    'ChildSearchSerializer',
    'OrganizationAccessSerializer',
    # Attendance Serializers
    'ClassroomSerializer',
    'ClassScheduleSerializer',
    'PersonClassScheduleSerializer',
    'PersonAttendanceSerializer',
    'CreateAttendanceRecordsSerializer'

]
