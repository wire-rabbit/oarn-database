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

from django.conf.urls import patterns, include, url
from rest_framework.urlpatterns import format_suffix_patterns

# Reference Model Views:
from oarndb.views import AdultChildRelationshipTypesList, AdultChildRelationshipTypesDetail
from oarndb.views import LanguagesList, LanguagesDetail
from oarndb.views import LanguageUseTypesList, LanguageUseTypesDetail
from oarndb.views import AdultFamilyRelationshipTypesList, AdultFamilyRelationshipTypesDetail
from oarndb.views import ChildFamilyRelationshipTypesList, ChildFamilyRelationshipTypesDetail
from oarndb.views import RacesList, RacesDetail
from oarndb.views import GendersList, GendersDetail
from oarndb.views import PersonTelephoneNumberTypesList, PersonTelephoneNumberTypesDetail
from oarndb.views import EmailTypesList, EmailTypesDetail
from oarndb.views import CountiesList, CountiesDetail
from oarndb.views import StatesList, StatesDetail
from oarndb.views import LocationTypesList, LocationTypesDetail
from oarndb.views import RolesList, RolesDetail
from oarndb.views import ContactTypesList, ContactTypesDetail
from oarndb.views import ProgramsList, ProgramsDetail
from oarndb.views import ServiceLevelsList, ServiceLevelsDetail
from oarndb.views import AttendanceStatusesList, AttendanceStatusesDetail
from oarndb.views import TransportTypesList, TransportTypesDetail
from oarndb.views import HomeVisitLocationsList, HomeVisitLocationsDetail
from oarndb.views import ReferredFromList, ReferredFromDetail
from oarndb.views import WaitlistStatusList, WaitlistStatusDetail
from oarndb.views import ServiceNeedList, ServiceNeedDetail

# Family Views:
from oarndb.views import PersonList, PersonDetail, PersonCreate
from oarndb.views import AdultList, AdultDetail
from oarndb.views import ChildList, ChildDetail
from oarndb.views import FamilyList, FamilyDetail, FamilyCreate
from oarndb.views import FamilyAddressList, FamilyAddressDetail, FamilyAddressCreate, FamilyNotesDetail
from oarndb.views import PersonRaceList, PersonRaceDetail, PersonLanguageList, PersonLanguageDetail
from oarndb.views import PersonTelephoneList, PersonTelephoneDetail, PersonEmailAddressList, PersonEmailAddressDetail
from oarndb.views import AdultFamilyRelationshipList, AdultFamilyRelationshipDetail
from oarndb.views import ChildFamilyRelationshipList, ChildFamilyRelationshipDetail

# Program Views:
from oarndb.views import CaseManagerList, CaseManagerCreate, CaseManagerDetail
from oarndb.views import FamilyEnrollmentList, FamilyEnrollmentDetail
from oarndb.views import PersonEnrollmentList, PersonEnrollmentDetail
from oarndb.views import ServiceLevelEnrollmentList, ServiceLevelEnrollmentDetail
from oarndb.views import FamilyEnrollmentReadOnlyList
from oarndb.views import WaitlistList, WaitlistDetail

# Home Visit Views:
from oarndb.views import HomeVisitList, HomeVisitDetail
from oarndb.views import ContactLogList, ContactLogDetail

# Assessment Views:
from oarndb.views import FamilyAssessmentList, FamilyAssessmentDetail
from oarndb.views import ChildAssessmentList, ChildAssessmentDetail
from oarndb.views import RiskFactorAssessmentList, RiskFactorAssessmentDetail
from oarndb.views import ASQList, ASQDetail
from oarndb.views import ASQSEList, ASQSEDetail
from oarndb.views import AssessmentIntervalList, AssessmentIntervalDetail
from oarndb.views import MaritalStatusList, MaritalStatusDetail
from oarndb.views import EmploymentList, EmploymentDetail
from oarndb.views import GrossMonthlyIncomeList, GrossMonthlyIncomeDetail
from oarndb.views import SizeOfFamilyList, SizeOfFamilyDetail
from oarndb.views import EmergencyServicesList, EmergencyServicesDetail
from oarndb.views import ReadingFrequencyList, ReadingFrequencyDetail
from oarndb.views import StrengthsScaleList, StrengthsScaleDetail
from oarndb.views import SmokeExposureScaleList, SmokeExposureScaleDetail
from oarndb.views import QualityScaleList, QualityScaleDetail
from oarndb.views import FrequencyScaleList, FrequencyScaleDetail
from oarndb.views import FrequencyScaleTwoList, FrequencyScaleTwoDetail
from oarndb.views import PrenatalCareList, PrenatalCareDetail
from oarndb.views import ChildWeightList, ChildWeightDetail
from oarndb.views import ChildHeightList, ChildHeightDetail
from oarndb.views import ImmunizationStatusList, ImmunizationStatusDetail
from oarndb.views import AsqseDevStatusList, AsqseDevStatusDetail
from oarndb.views import AsqScreeningAgeList, AsqScreeningAgeDetail
from oarndb.views import AsqseScreeningAgeList, AsqseScreeningAgeDetail
from oarndb.views import YesNoDkList, YesNoDkDetail
from oarndb.views import AsqIntervalList, AsqIntervalDetail
from oarndb.views import AsqseIntervalList, AsqseIntervalDetail

# Attendance Views:
from oarndb.views import ClassroomList, ClassroomDetail
from oarndb.views import ClassScheduleList, ClassScheduleDetail
from oarndb.views import PersonClassScheduleList, PersonClassScheduleDetail
from oarndb.views import PersonAttendanceList, PersonAttendanceDetail
from oarndb.views import CreateAttendanceRecords

# Org Views:
from oarndb.views import OrganizationAccessView, OrganizationLocationList, OrganizationLocationDetail

# Procedural Views:
from oarndb.views import AdultSearchList, ChildSearchList

urlpatterns = (
    url(r'ref/adult-child-relationship-types/$', AdultChildRelationshipTypesList.as_view(),
        name='adult-child-relationship-types-list'),

    url(r'ref/adult-child-relationship-types/(?P<pk>[0-9]+)/$', AdultChildRelationshipTypesDetail.as_view(),
        name='adult-child-relationship-types-detail'),

    url(r'ref/languages/$', LanguagesList.as_view(), name='languages-list'),

    url(r'ref/languages/(?P<pk>[0-9]+)/$', LanguagesDetail.as_view(), name='languages-detail'),

    url(r'ref/language-use-types/$', LanguageUseTypesList.as_view(), name='language-use-types-list'),

    url(r'ref/language-use-types/(?P<pk>[0-9]+)/$', LanguageUseTypesDetail.as_view(), name='language-use-types-detail'),

    url(r'ref/adult-family-relationship-types/$', AdultFamilyRelationshipTypesList.as_view(),
        name='adult-family-relationship-types-list'),

    url(r'ref/adult-family-relationship-types/(?P<pk>[0-9]+)/$', AdultFamilyRelationshipTypesDetail.as_view(),
        name='adult-family-relationship-types-detail'),

    url(r'ref/child-family-relationship-types/$', ChildFamilyRelationshipTypesList.as_view(),
        name='child-family-relationship-types-list'),

    url(r'ref/child-family-relationship-types/(?P<pk>[0-9]+)/$', ChildFamilyRelationshipTypesDetail.as_view(),
        name='child-family-relationship-types-detail'),

    url(r'ref/races/$', RacesList.as_view(), name='races-list'),

    url(r'ref/races/(?P<pk>[0-9]+)/$', RacesDetail.as_view(), name='races-detail'),

    url(r'ref/genders/$', GendersList.as_view(), name='genders-list'),

    url(r'ref/genders/(?P<pk>[0-9]+)/$', GendersDetail.as_view(), name='genders-detail'),

    url(r'ref/person-telephone-number-types/$', PersonTelephoneNumberTypesList.as_view(),
        name='person-telephone-numbers-list'),

    url(r'ref/person-telephone-number-types/(?P<pk>[0-9]+)/$', PersonTelephoneNumberTypesDetail.as_view(),
        name='person-telephone-numbers-detail'),

    url(r'ref/email-types/$', EmailTypesList.as_view(), name='email-types-list'),

    url(r'ref/email-types/(?P<pk>[0-9]+)/$', EmailTypesDetail.as_view(), name='email-types-detail'),

    url(r'ref/counties/$', CountiesList.as_view(), name='counties-list'),

    url(r'ref/counties/(?P<pk>[0-9]+)/$', CountiesDetail.as_view(), name='counties-detail'),

    url(r'ref/states/$', StatesList.as_view(), name='states-list'),

    url(r'ref/states/(?P<pk>[0-9]+)/$', StatesDetail.as_view(), name='states-detail'),

    url(r'ref/location-types/$', LocationTypesList.as_view(), name='location-types-list'),

    url(r'ref/location-types/(?P<pk>[0-9]+)/$', LocationTypesDetail.as_view(), name='location-types-detail'),

    url(r'ref/roles/$', RolesList.as_view(), name='roles-list'),

    url(r'ref/roles/(?P<pk>[0-9]+)/$', RolesDetail.as_view(), name='roles-detail'),

    url(r'ref/contact-types/$', ContactTypesList.as_view(), name='contact-types-list'),

    url(r'ref/contact-types/(?P<pk>[0-9]+)/$', ContactTypesDetail.as_view(), name='contact-types-detail'),

    url(r'ref/programs/$', ProgramsList.as_view(), name='programs-list'),

    url(r'ref/programs/(?P<pk>[0-9]+)/$', ProgramsDetail.as_view(), name='programs-detail'),

    url(r'ref/service-levels/$', ServiceLevelsList.as_view(), name='service-levels-list'),

    url(r'ref/service-levels/(?P<pk>[0-9]+)/$', ServiceLevelsDetail.as_view(), name='service-levels-detail'),

    url(r'ref/attendance-statuses/$', AttendanceStatusesList.as_view()),
    url(r'ref/attendance-statuses/(?P<pk>[0-9]+)/$', AttendanceStatusesDetail.as_view()),
    url(r'ref/transport-types/$', TransportTypesList.as_view()),
    url(r'ref/transport-types/(?P<pk>[0-9]+)/$', TransportTypesDetail.as_view()),
    url(r'ref/home-visit-locations/$', HomeVisitLocationsList.as_view()),
    url(r'ref/home-visit-locations/(?P<pk>[0-9]+)/$', HomeVisitLocationsDetail.as_view()),
    url(r'ref/referred-from/$', ReferredFromList.as_view()),
    url(r'ref/referred-from/(?P<pk>[0-9]+)/$', ReferredFromDetail.as_view()),

    url(r'ref/marital-statuses/$', MaritalStatusList.as_view(), name='marital-status-list'),
    url(r'ref/marital-statuses/(?P<pk>[0-9]+)/$', MaritalStatusDetail.as_view(), name='marital-status-detail'),

    url(r'ref/employment-statuses/$', EmploymentList.as_view(), name='employment-status-list'),
    url(r'ref/employment-statuses/(?P<pk>[0-9]+)/$', EmploymentDetail.as_view(), name='employment-status-detail'),

    url(r'ref/gross-monthly-income/$', GrossMonthlyIncomeList.as_view(), name='gross-monthly-income-list'),
    url(r'ref/gross-monthly-income/(?P<pk>[0-9]+)/$', GrossMonthlyIncomeDetail.as_view(),
        name='gross-monthly-income-detail'),

    url(r'ref/size-of-family/$', SizeOfFamilyList.as_view(), name='size-of-family-list'),
    url(r'ref/size-of-family/(?P<pk>[0-9]+)/$', SizeOfFamilyDetail.as_view(),
        name='size-of-family-detail'),

    url(r'ref/emergency-services/$', EmergencyServicesList.as_view(), name='emergency-services-list'),
    url(r'ref/emergency-services/(?P<pk>[0-9]+)/$', EmergencyServicesDetail.as_view(),
        name='emergency-services-detail'),

    url(r'ref/reading-frequency/$', ReadingFrequencyList.as_view(), name='reading-frequency-list'),
    url(r'ref/reading-frequency/(?P<pk>[0-9]+)/$', ReadingFrequencyDetail.as_view(),
        name='reading-frequency-detail'),

    url(r'ref/strengths-scale/$', StrengthsScaleList.as_view(), name='strengths-scale-list'),
    url(r'ref/strengths-scale/(?P<pk>[0-9]+)/$', StrengthsScaleDetail.as_view(),
        name='strengths-scale-detail'),

    url(r'ref/smoke-exposure-scale/$', SmokeExposureScaleList.as_view(), name='smoke-exposure-scale-list'),
    url(r'ref/smoke-exposure-scale/(?P<pk>[0-9]+)/$', SmokeExposureScaleDetail.as_view(),
        name='smoke-exposure-scale-detail'),

    url(r'ref/quality-scale/$', QualityScaleList.as_view(), name='quality-scale-list'),
    url(r'ref/quality-scale/(?P<pk>[0-9]+)/$', QualityScaleDetail.as_view(),
        name='quality-scale-detail'),

    url(r'ref/assessment-intervals/$', AssessmentIntervalList.as_view(), name='assessment-interval-list'),
    url(r'ref/assessment-intervals/(?P<pk>[0-9]+)/$', AssessmentIntervalDetail.as_view(),
        name='assessment-interval-detail'),

    url(r'ref/frequency-scale/$', FrequencyScaleList.as_view(), name='frequency-scale-list'),
    url(r'ref/frequency-scale/(?P<pk>[0-9]+)/$', FrequencyScaleDetail.as_view(),
        name='frequency-scale-detail'),

    url(r'ref/frequency-scale-two/$', FrequencyScaleTwoList.as_view(), name='frequency-scale-two-list'),
    url(r'ref/frequency-scale-two/(?P<pk>[0-9]+)/$', FrequencyScaleTwoDetail.as_view(),
        name='frequency-scale-two-detail'),

    url(r'ref/yes-no-dk/$', YesNoDkList.as_view(), name='yes-no-dk-list'),
    url(r'ref/yes-no-dk/(?P<pk>[0-9]+)/$', YesNoDkDetail.as_view(),
        name='yes-no-dk-detail'),

    url(r'ref/asq-screening-age/$', AsqScreeningAgeList.as_view(), name='asq-screening-age-list'),
    url(r'ref/asq-screening-age/(?P<pk>[0-9]+)/$', AsqScreeningAgeDetail.as_view(),
        name='asq-screening-age-detail'),

    url(r'ref/asqse-screening-age/$', AsqseScreeningAgeList.as_view(), name='asqse-screening-age-list'),
    url(r'ref/asqse-screening-age/(?P<pk>[0-9]+)/$', AsqseScreeningAgeDetail.as_view(),
        name='asqse-screening-age-detail'),

    url(r'ref/asqse-dev-status/$', AsqseDevStatusList.as_view(), name='asqse-dev-status-list'),
    url(r'ref/asqse-dev-status/(?P<pk>[0-9]+)/$', AsqseDevStatusDetail.as_view(),
        name='asqse-dev-status-detail'),

    url(r'ref/immunization-status/$', ImmunizationStatusList.as_view(), name='immunization-status-list'),
    url(r'ref/immunization-status/(?P<pk>[0-9]+)/$', ImmunizationStatusDetail.as_view(),
        name='immunization-status-detail'),

    url(r'ref/child-height/$', ChildHeightList.as_view(), name='child-height-list'),
    url(r'ref/child-height/(?P<pk>[0-9]+)/$', ChildHeightDetail.as_view(),
        name='child-height-detail'),

    url(r'ref/child-weight/$', ChildWeightList.as_view(), name='child-weight-list'),
    url(r'ref/child-weight/(?P<pk>[0-9]+)/$', ChildWeightDetail.as_view(),
        name='child-weight-detail'),

    url(r'ref/prenatal-care/$', PrenatalCareList.as_view(), name='prenatal-care-list'),
    url(r'ref/prenatal-care/(?P<pk>[0-9]+)/$', PrenatalCareDetail.as_view(),
        name='prenatal-care-detail'),

    url(r'ref/asq-intervals/$', AsqIntervalList.as_view(), name='asq-interval-list'),
    url(r'ref/asq-intervals/(?P<pk>[0-9]+)/$', AsqIntervalDetail.as_view(),
        name='asq-interval-detail'),

    url(r'ref/asqse-intervals/$', AsqseIntervalList.as_view(), name='asqse-interval-list'),
    url(r'ref/asqse-intervals/(?P<pk>[0-9]+)/$', AsqseIntervalDetail.as_view(),
        name='asqse-interval-detail'),

    url(r'ref/service-needs/$', ServiceNeedList.as_view(), name='service-need-list'),
    url(r'ref/service-needs/(?P<pk>[0-9]+)/$', ServiceNeedDetail.as_view(),
        name='service-need-detail'),

    url(r'ref/waitlist-status/$', WaitlistStatusList.as_view(), name='waitlist-status-list'),
    url(r'ref/waitlist-status/(?P<pk>[0-9]+)/$', WaitlistStatusDetail.as_view(),
        name='waitlist-status-detail'),

    # Family Views:
    url(r'family/person/$', PersonList.as_view(), name='person-list'),
    url(r'family/person/(?P<pk>[0-9]+)/$', PersonDetail.as_view(), name='person-detail'),
    url(r'family/person/create/$', PersonCreate.as_view(), name='person-create'),

    url(r'family/adult-search/$', AdultSearchList.as_view(), name='adult-search-list'),
    url(r'family/child-search/$', ChildSearchList.as_view(), name='child-search-list'),

    url(r'family/$', FamilyList.as_view(), name='family-list'),
    url(r'family/(?P<pk>[0-9]+)/$', FamilyDetail.as_view(), name='family-detail'),
    url(r'family/create/$', FamilyCreate.as_view(), name='family-create'),

    url(r'family/addresses/$', FamilyAddressList.as_view(), name='addresses-list'),
    url(r'family/addresses/(?P<pk>[0-9]+)/$', FamilyAddressDetail.as_view(), name='addresses-detail'),
    url(r'family/addresses/create/$', FamilyAddressCreate.as_view(), name='addresses-create'),
    url(r'family/(?P<pk>[0-9]+)/notes/$', FamilyNotesDetail.as_view(), name='family-notes'),

    url(r'family/person/race/$', PersonRaceList.as_view(), name='race-list'),
    url(r'family/person/(?P<pk>[0-9]+)/race/$', PersonRaceDetail.as_view(), name='race-detail'),

    url(r'family/person/language/$', PersonLanguageList.as_view(), name='language-list'),
    url(r'family/person/language/(?P<pk>[0-9]+)/$', PersonLanguageDetail.as_view(), name='language-detail'),

    url(r'family/person/telephone/$', PersonTelephoneList.as_view(), name='telephone-list'),
    url(r'family/person/telephone/(?P<pk>[0-9]+)/$', PersonTelephoneDetail.as_view(), name='telephone-detail'),

    url(r'family/person/email/$', PersonEmailAddressList.as_view(), name='email-list'),
    url(r'family/person/email/(?P<pk>[0-9]+)/$', PersonEmailAddressDetail.as_view(), name='email-detail'),

    url(r'family/adult-family-relationship/$', AdultFamilyRelationshipList.as_view(), name='adult-family-list'),
    url(r'family/adult-family-relationship/(?P<pk>[0-9]+)/$', AdultFamilyRelationshipDetail.as_view(),
        name='adult-family-detail'),

    url(r'family/child-family-relationship/$', ChildFamilyRelationshipList.as_view(), name='child-family-list'),
    url(r'family/child-family-relationship/(?P<pk>[0-9]+)/$', ChildFamilyRelationshipDetail.as_view(),
        name='child-family-detail'),

    url(r'family/adult/$', AdultList.as_view(), name='adult-list'),
    url(r'family/adult/(?P<pk>[0-9]+)/$', AdultDetail.as_view(), name='adult-detail'),

    url(r'family/child/$', ChildList.as_view(), name='child-list'),
    url(r'family/child/(?P<pk>[0-9]+)/$', ChildDetail.as_view(), name='child-detail'),

    # Program Views:
    url(r'program/case-managers/$', CaseManagerList.as_view(), name='case-managers-list'),
    url(r'program/case-managers/(?P<pk>[0-9]+)/$', CaseManagerDetail.as_view(), name='case-managers-detail'),
    url(r'program/case-managers/create/$', CaseManagerCreate.as_view(), name='case-managers-create'),

    url(r'program/family-enrollment/$', FamilyEnrollmentList.as_view(), name='family-enrollment-list'),
    url(r'program/family-enrollment/(?P<pk>[0-9]+)/$', FamilyEnrollmentDetail.as_view(),
        name='family-enrollment-detail'),

    url(r'program/person-enrollment/$', PersonEnrollmentList.as_view(), name='person-enrollment-list'),
    url(r'program/person-enrollment/(?P<pk>[0-9]+)/$', PersonEnrollmentDetail.as_view(),
        name='person-enrollment-detail'),

    url(r'program/service-level-enrollment/$', ServiceLevelEnrollmentList.as_view(), name='service-level-list'),
    url(r'program/service-level-enrollment/(?P<pk>[0-9]+)/$', ServiceLevelEnrollmentDetail.as_view(),
        name='service-level-detail'),

    url(r'program/family-enrollment-full/$', FamilyEnrollmentReadOnlyList.as_view(), name='family-enrollment-full'),

    url(r'program/waitlist/$', WaitlistList.as_view(), name='waitlist-list'),
    url(r'program/waitlist/(?P<pk>[0-9]+)/$', WaitlistDetail.as_view(),
        name='waitlist-detail'),

    # Home Visit Views:
    url(r'family/home-visit/$', HomeVisitList.as_view(), name='home-visit-list'),
    url(r'family/home-visit/(?P<pk>[0-9]+)/$', HomeVisitDetail.as_view(), name='home-visit-detail'),

    url(r'family/contact-log/$', ContactLogList.as_view(), name='contact-log-list'),
    url(r'family/contact-log/(?P<pk>[0-9]+)/$', ContactLogDetail.as_view(), name='contact-log-detail'),

    # Org Views:
    url(r'organization/access/$', OrganizationAccessView.as_view(), name='organization-access-list'),

    url(r'organization/locations/$', OrganizationLocationList.as_view(), name='org-location-list'),
    url(r'organization/locations/(?P<pk>[0-9]+)/$', OrganizationLocationDetail.as_view(), name='org-location-detail'),

    # Assessment Views:
    url(r'assessments/family-assessments/$', FamilyAssessmentList.as_view(), name='family-assessment-list'),
    url(r'assessments/family-assessments/(?P<pk>[0-9]+)/$', FamilyAssessmentDetail.as_view(),
        name='family-assessment-detail'),

    url(r'assessments/child-assessments/$', ChildAssessmentList.as_view(), name='child-assessment-list'),
    url(r'assessments/child-assessments/(?P<pk>[0-9]+)/$', ChildAssessmentDetail.as_view(),
        name='child-assessment-detail'),

    url(r'assessments/risk-factor-assessments/$', RiskFactorAssessmentList.as_view(),
        name='risk-factor-assessment-list'),
    url(r'assessments/risk-factor-assessments/(?P<pk>[0-9]+)/$', RiskFactorAssessmentDetail.as_view(),
        name='risk-factor-assessment-detail'),

    url(r'assessments/asq/$', ASQList.as_view(),
        name='asq-list'),
    url(r'assessments/asq/(?P<pk>[0-9]+)/$', ASQDetail.as_view(),
        name='asq-detail'),

    url(r'assessments/asqse/$', ASQSEList.as_view(),
        name='asq-list'),
    url(r'assessments/asqse/(?P<pk>[0-9]+)/$', ASQSEDetail.as_view(),
        name='asq-detail'),

    # Attendance Views:
    url(r'attendance/classrooms/$', ClassroomList.as_view(), name='classroom-list'),
    url(r'attendance/classrooms/(?P<pk>[0-9]+)/$', ClassroomDetail.as_view(), name='classroom-detail'),

    url(r'attendance/class-schedules/$', ClassScheduleList.as_view(), name='class-schedule-list'),
    url(r'attendance/class-schedules/(?P<pk>[0-9]+)/$', ClassScheduleDetail.as_view(), name='class-schedule-detail'),

    url(r'attendance/person-class-schedules/$', PersonClassScheduleList.as_view(),
        name='person-class-schedule-list'),
    url(r'attendance/person-class-schedules/(?P<pk>[0-9]+)/$', PersonClassScheduleDetail.as_view(),
        name='person-class-schedule-detail'),

    url(r'attendance/person-attendance/$', PersonAttendanceList.as_view(),
        name='person-attendance-list'),
    url(r'attendance/person-attendance/(?P<pk>[0-9]+)/$', PersonAttendanceDetail.as_view(),
        name='person-attendance-detail'),

    url(r'attendance/create-attendance-records/$', CreateAttendanceRecords.as_view(), name='create-attendance-records'),
)

urlpatterns = format_suffix_patterns(urlpatterns)
