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

from oarndb.views.base_views import ListCreateAPIView
from oarndb.views.base_views import RetrieveUpdateDestroyAPIView
# Reference Model Views:
from oarndb.views.reference_views import AdultChildRelationshipTypesList, AdultChildRelationshipTypesDetail
from oarndb.views.reference_views import LanguagesList, LanguagesDetail
from oarndb.views.reference_views import LanguageUseTypesList, LanguageUseTypesDetail
from oarndb.views.reference_views import AdultFamilyRelationshipTypesList, AdultFamilyRelationshipTypesDetail
from oarndb.views.reference_views import ChildFamilyRelationshipTypesList, ChildFamilyRelationshipTypesDetail
from oarndb.views.reference_views import RacesList, RacesDetail
from oarndb.views.reference_views import GendersList, GendersDetail
from oarndb.views.reference_views import PersonTelephoneNumberTypesList, PersonTelephoneNumberTypesDetail
from oarndb.views.reference_views import EmailTypesList,EmailTypesDetail
from oarndb.views.reference_views import CountiesList, CountiesDetail
from oarndb.views.reference_views import StatesList, StatesDetail
from oarndb.views.reference_views import LocationTypesList, LocationTypesDetail
from oarndb.views.reference_views import RolesList, RolesDetail
from oarndb.views.reference_views import ContactTypesList, ContactTypesDetail
from oarndb.views.reference_views import ProgramsList, ProgramsDetail
from oarndb.views.reference_views import ServiceLevelsList, ServiceLevelsDetail
from oarndb.views.reference_views import AttendanceStatusesList, AttendanceStatusesDetail
from oarndb.views.reference_views import TransportTypesList, TransportTypesDetail
from oarndb.views.reference_views import HomeVisitLocationsList, HomeVisitLocationsDetail
from oarndb.views.reference_views import ReferredFromList, ReferredFromDetail
from oarndb.views.reference_views import WaitlistStatusList, WaitlistStatusDetail
from oarndb.views.reference_views import ServiceNeedList, ServiceNeedDetail

# Family Views:
from oarndb.views.family_views import PersonList, PersonDetail, PersonCreate
from oarndb.views.family_views import AdultList, AdultDetail
from oarndb.views.family_views import ChildList, ChildDetail
from oarndb.views.family_views import FamilyList, FamilyDetail, FamilyCreate
from oarndb.views.family_views import FamilyAddressList, FamilyAddressDetail, FamilyAddressCreate
from oarndb.views.family_views import FamilyNotesDetail, PersonRaceList, PersonRaceDetail
from oarndb.views.family_views import PersonLanguageList, PersonLanguageDetail
from oarndb.views.family_views import PersonTelephoneList, PersonTelephoneDetail
from oarndb.views.family_views import PersonEmailAddressList, PersonEmailAddressDetail
from oarndb.views.family_views import AdultFamilyRelationshipList, AdultFamilyRelationshipDetail
from oarndb.views.family_views import ChildFamilyRelationshipList, ChildFamilyRelationshipDetail

# Program Views:
from oarndb.views.program_views import CaseManagerList, CaseManagerCreate, CaseManagerDetail
from oarndb.views.program_views import FamilyEnrollmentList, FamilyEnrollmentDetail
from oarndb.views.program_views import PersonEnrollmentList, PersonEnrollmentDetail
from oarndb.views.program_views import ServiceLevelEnrollmentList, ServiceLevelEnrollmentDetail
from oarndb.views.program_views import FamilyEnrollmentReadOnlyList
from oarndb.views.waitlist_views import WaitlistList, WaitlistDetail

# Home Visit Views:
from oarndb.views.home_visit_views import HomeVisitList, HomeVisitDetail
from oarndb.views.home_visit_views import ContactLogList, ContactLogDetail

# Assessment Views
from oarndb.views.assessment_views import FamilyAssessmentList, FamilyAssessmentDetail
from oarndb.views.assessment_views import ChildAssessmentList, ChildAssessmentDetail
from oarndb.views.assessment_views import RiskFactorAssessmentList, RiskFactorAssessmentDetail
from oarndb.views.assessment_views import ASQList, ASQDetail
from oarndb.views.assessment_views import ASQSEList, ASQSEDetail
from oarndb.views.assessment_views import AssessmentIntervalList, AssessmentIntervalDetail
from oarndb.views.assessment_views import MaritalStatusList, MaritalStatusDetail
from oarndb.views.assessment_views import EmploymentList, EmploymentDetail
from oarndb.views.assessment_views import GrossMonthlyIncomeList, GrossMonthlyIncomeDetail
from oarndb.views.assessment_views import SizeOfFamilyList, SizeOfFamilyDetail
from oarndb.views.assessment_views import EmergencyServicesList, EmergencyServicesDetail
from oarndb.views.assessment_views import FrequencyScaleList, FrequencyScaleDetail
from oarndb.views.assessment_views import ReadingFrequencyList, ReadingFrequencyDetail
from oarndb.views.assessment_views import StrengthsScaleList, StrengthsScaleDetail
from oarndb.views.assessment_views import SmokeExposureScaleList, SmokeExposureScaleDetail
from oarndb.views.assessment_views import QualityScaleList, QualityScaleDetail
from oarndb.views.assessment_views import FrequencyScaleTwoList, FrequencyScaleTwoDetail
from oarndb.views.assessment_views import PrenatalCareList, PrenatalCareDetail
from oarndb.views.assessment_views import ChildWeightList, ChildWeightDetail
from oarndb.views.assessment_views import ChildHeightList, ChildHeightDetail
from oarndb.views.assessment_views import ImmunizationStatusList, ImmunizationStatusDetail
from oarndb.views.assessment_views import AsqseDevStatusList, AsqseDevStatusDetail
from oarndb.views.assessment_views import AsqScreeningAgeList, AsqScreeningAgeDetail
from oarndb.views.assessment_views import AsqseScreeningAgeList, AsqseScreeningAgeDetail
from oarndb.views.assessment_views import YesNoDkList, YesNoDkDetail
from oarndb.views.assessment_views import AsqIntervalList, AsqIntervalDetail
from oarndb.views.assessment_views import AsqseIntervalList, AsqseIntervalDetail

# Org Views:
from oarndb.views.org_views import StaffListView
from oarndb.views.org_views import OrganizationAccessView, OrganizationLocationList, OrganizationLocationDetail

# Procedural Views:
from oarndb.views.search_views import AdultSearchList
from oarndb.views.search_views import ChildSearchList

# Attendance Views:
from oarndb.views.attendance_views import ClassroomList, ClassroomDetail
from oarndb.views.attendance_views import ClassScheduleList, ClassScheduleDetail
from oarndb.views.attendance_views import PersonClassScheduleList, PersonClassScheduleDetail
from oarndb.views.attendance_views import PersonAttendanceList, PersonAttendanceDetail
from oarndb.views.attendance_views import CreateAttendanceRecords

__all__ = [
    # Core:
    'ListCreateAPIView',
    'RetrieveUpdateDestroyAPIView',

    # Reference Model Views:
    'AdultChildRelationshipTypesList',
    'AdultChildRelationshipTypesDetail',
    'LanguagesList',
    'LanguagesDetail',
    'LanguageUseTypesList',
    'LanguageUseTypesDetai',
    'AdultFamilyRelationshipTypesList',
    'AdultFamilyRelationshipTypesDetail',
    'ChildFamilyRelationshipTypesList',
    'ChildFamilyRelationshipTypesDetail',
    'RacesList',
    'RacesDetail',
    'GendersList',
    'GendersDetail',
    'PersonTelephoneNumberTypesList',
    'PersonTelephoneNumberTypesDetail',
    'EmailTypesList',
    'EmailTypesDetail',
    'CountiesList',
    'CountiesDetail',
    'StatesList',
    'StatesDetail',
    'LocationTypesList',
    'LocationTypesDetail',
    'RolesList',
    'RolesDetail',
    'ContactTypesList',
    'ContactTypesDetail',
    'ProgramsList',
    'ProgramsDetail',
    'ServiceLevelsList',
    'ServiceLevelsDetail',
    'AttendanceStatusesList',
    'AttendanceStatusesDetail',
    'TransportTypesList',
    'TransportTypesDetail',
    'HomeVisitLocationsList',
    'HomeVisitLocationsDetail',
    'ReferredFromList',
    'ReferredFromDetail',
    'WaitlistStatusList',
    'WaitlistStatusDetail',
    'ServiceNeedList',
    'ServiceNeedDetail',
    # Family Views:
    'PersonList',
    'PersonDetail',
    'PersonCreate',
    'AdultList',
    'AdultDetail',
    'ChildList',
    'ChildDetail',
    'FamilyList',
    'FamilyDetail',
    'FamilyCreate',
    'FamilyAddressList',
    'FamilyAddressDetail',
    'FamilyAddressCreate',
    'FamilyNotesDetail',
    'PersonRaceList',
    'PersonRaceDetail',
    'PersonLanguageList',
    'PersonLanguageDetail',
    'PersonTelephoneList',
    'PersonTelephoneDetail',
    'PersonEmailAddressList',
    'PersonEmailAddressDetail',
    'AdultFamilyRelationshipList',
    'AdultFamilyRelationshipDetail',
    'ChildFamilyRelationshipList',
    'ChildFamilyRelationshipDetail',
    # Program Views:
    'CaseManagerList',
    'CaseManagerCreate',
    'CaseManagerDetail',
    'FamilyEnrollmentList',
    'FamilyEnrollmentDetail',
    'PersonEnrollmentList',
    'PersonEnrollmentDetail',
    'ServiceLevelEnrollmentList',
    'ServiceLevelEnrollmentDetail',
    'FamilyEnrollmentReadOnlyList',
    'WaitlistList',
    'WaitlistDetail',
    # Home Visit Views:
    'HomeVisitList',
    'HomeVisitDetail',
    'ContactLogList',
    'ContactLogDetail',
    # Assessment Views:
    'FamilyAssessmentList',
    'FamilyAssessmentDetail',
    'ChildAssessmentList',
    'ChildAssessmentDetail',
    'RiskFactorAssessmentList',
    'RiskFactorAssessmentDetail',
    'ASQList',
    'ASQDetail',
    'ASQSEList',
    'ASQSEDetail',
    'MaritalStatusList',
    'MaritalStatusDetail',
    'EmploymentList',
    'EmploymentDetail',
    'GrossMonthlyIncomeList',
    'GrossMonthlyIncomeDetail',
    'SizeOfFamilyList',
    'SizeOfFamilyDetail',
    'EmergencyServicesList',
    'EmergencyServicesDetail',
    'FrequencyScaleList',
    'FrequencyScaleDetail',
    'ReadingFrequencyList',
    'ReadingFrequencyDetail',
    'StrengthsScaleList',
    'StrengthsScaleDetail',
    'SmokeExposureScaleList',
    'SmokeExposureScaleDetail',
    'QualityScaleList',
    'QualityScaleDetail',
    'FrequencyScaleTwoList',
    'FrequencyScaleTwoDetail',
    'PrenatalCareList',
    'PrenatalCareDetail',
    'ChildWeightList',
    'ChildWeightDetail',
    'ChildHeightList',
    'ChildHeightDetail',
    'ImmunizationStatusList',
    'ImmunizationStatusDetail',
    'AsqseDevStatusList',
    'AsqseDevStatusDetail',
    'AsqScreeningAgeList',
    'AsqScreeningAgeDetail',
    'AsqseScreeningAgeList',
    'AsqseScreeningAgeDetail',
    'YesNoDKList',
    'YesNoDKDetail',
    'AsqIntervalList',
    'AsqIntervalDetail',
    'AsqseIntervalList',
    'AsqseIntervalDetail',
    # Org Views:
    'StaffListView',
    'OrganizationAccessView',
    'OrganizationLocationList',
    'OrganizationLocationDetail',
    # Procedural Views:
    'AdultSearchList',
    'ChildSearchList',
    # Attendance Views:
    'ClassroomList',
    'ClassroomDetail',
    'ClassScheduleList',
    'ClassScheduleDetail',
    'PersonClassScheduleList',
    'PersonClassScheduleDetail',
    'PersonAttendanceList',
    'PersonAttendanceDetail',
    'CreateAttendanceRecords'
]
