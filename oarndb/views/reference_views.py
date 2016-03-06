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

from django.db.models import Q
from rest_framework import permissions, generics
from oarndb.views import base_views

from oarndb.models import RefServiceLevel, Organization

from oarndb.serializers import RefAdultChildRelationshipTypeSerializer
from oarndb.serializers import RefLanguageSerializer
from oarndb.serializers import RefLanguageUseTypeSerializer
from oarndb.serializers import RefAdultFamilyRelationshipTypeSerializer
from oarndb.serializers import RefChildFamilyRelationshipTypeSerializer
from oarndb.serializers import RefRaceSerializer
from oarndb.serializers import RefGenderSerializer
from oarndb.serializers import RefPersonTelephoneNumberTypeSerializer
from oarndb.serializers import RefEmailTypeSerializer
from oarndb.serializers import RefCountySerializer
from oarndb.serializers import RefStateSerializer
from oarndb.serializers import RefLocationTypeSerializer
from oarndb.serializers import RefRoleSerializer
from oarndb.serializers import RefContactTypeSerializer
from oarndb.serializers import RefProgramSerializer
from oarndb.serializers import RefServiceLevelSerializer
from oarndb.serializers import RefAttendanceStatusSerializer
from oarndb.serializers import RefTransportTypeSerializer
from oarndb.serializers import RefHomeVisitLocationSerializer
from oarndb.serializers import RefReferredFromSerializer
from oarndb.serializers import RefWaitlistStatusSerializer
from oarndb.serializers import RefServiceNeedSerializer


class AdultChildRelationshipTypesList(base_views.ListCreateAPIView):
    """
    A list of relationship types between an adult and a child, such as 'Biological Mother'.

    These records map to the RefAdultChildRelationshipType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefAdultChildRelationshipTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)

class AdultChildRelationshipTypesDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single relationship type between an adult and a child, such as 'Biological Mother'.

    These records map to the RefAdultChildRelationshipType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefAdultChildRelationshipTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class LanguagesList(base_views.ListCreateAPIView):
    """
    A list of languages spoken by clients.

    These records map to the RefLanguage model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """
    serializer_class = RefLanguageSerializer

    permission_classes = (permissions.IsAuthenticated,)


class LanguagesDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single language spoken by clients.

    These records map to the RefLanguage model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """
    serializer_class = RefLanguageSerializer

    permission_classes = (permissions.IsAuthenticated,)


class LanguageUseTypesList(base_views.ListCreateAPIView):
    """
    A list of values indicating the context in which a language is used.

    These records map to the RefLanguageUseType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefLanguageUseTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class LanguageUseTypesDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single value indicating the context in which a language is used.

    These records map to the RefLanguageUseType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefLanguageUseTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class AdultFamilyRelationshipTypesList(base_views.ListCreateAPIView):
    """
    A list of values describing the relationship of an adult to a family.

    These records map to the RefAdultFamilyRelationshipType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefAdultFamilyRelationshipTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class AdultFamilyRelationshipTypesDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single value that defines the relationship of an adult to a family.

    These records map to the RefAdultFamilyRelationshipType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefAdultFamilyRelationshipTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)

class ChildFamilyRelationshipTypesList(base_views.ListCreateAPIView):
    """
    A list of values describing the relationship of a child to a family, e.g., "Biological Child",
    "Foster Child", etc.

    These records map to the RefChildFamilyRelationshipType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefChildFamilyRelationshipTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class ChildFamilyRelationshipTypesDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single value defining a relationship of a child to a family, e.g., "Biological Child",
    "Foster Child", etc.

    These records map to the RefChildFamilyRelationshipType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefChildFamilyRelationshipTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class RacesList(base_views.ListCreateAPIView):
    """
    A list of races, as distinct from ethnicity.

    These records map to the RefRace model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefRaceSerializer

    permission_classes = (permissions.IsAuthenticated,)


class RacesDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    A single race, as distinct from ethnicity.

    These records map to the RefRace model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefRaceSerializer

    permission_classes = (permissions.IsAuthenticated,)


class GendersList(base_views.ListCreateAPIView):
    """
    A list of genders.

    These records map to the RefGender model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefGenderSerializer

    permission_classes = (permissions.IsAuthenticated,)


class GendersDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    A single gender.

    These records map to the RefGender model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefGenderSerializer

    permission_classes = (permissions.IsAuthenticated,)


class PersonTelephoneNumberTypesList(base_views.ListCreateAPIView):
    """
    A list of phone number types, e.g., "Home", "Cell".

    These records map to the RefPersonTelephoneNumberType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefPersonTelephoneNumberTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class PersonTelephoneNumberTypesDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    A single phone type, e.g., "Home", "Cell"

    These records map to the RefPersonTelephoneNumberType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefPersonTelephoneNumberTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class EmailTypesList(base_views.ListCreateAPIView):
    """
    A list of email types, e.g., "Home", "Work"

    These records map to the RefEmailType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    """

    serializer_class = RefEmailTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class EmailTypesDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    A single email type, e.g., "Home", "Work"

    These records map to the RefEmailType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefEmailTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class CountiesList(base_views.ListCreateAPIView):
    """
    A list of Oregon county names.

    These records map to the RefCounty model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefCountySerializer

    permission_classes = (permissions.IsAuthenticated,)


class CountiesDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    The name of an Oregon county.

    These records map to the RefCounty model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefCountySerializer

    permission_classes = (permissions.IsAuthenticated,)



class StatesList(base_views.ListCreateAPIView):
    """
    A simple list of US states.

    These records map to the RefState model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefStateSerializer

    permission_classes = (permissions.IsAuthenticated,)


class StatesDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    A simple list of US states.

    These records map to the RefState model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Delete requires global_admin membership and after deleting *every* record will replace foreign
    key references to the deleted records with null.
    """

    serializer_class = RefStateSerializer

    permission_classes = (permissions.IsAuthenticated,)



class LocationTypesList(base_views.ListCreateAPIView):
    """
    A list of housing types: "Residential Home", "Apartment", "Shelter", etc.

    These records map to the RefLocationType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefLocationTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class LocationTypesDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    A single housing type: "Residential Home", "Apartment", "Shelter", etc.

    These records map to the RefLocationType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefLocationTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class RolesList(base_views.ListCreateAPIView):
    """
    A list of the roles a person can have within an organization.

    These records map to the RefRole model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefRoleSerializer

    permission_classes = (permissions.IsAuthenticated,)


class RolesDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single role a person may have within an organization.

    These records map to the RefRole model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefRoleSerializer

    permission_classes = (permissions.IsAuthenticated,)



class ContactTypesList(base_views.ListCreateAPIView):
    """
    A list of the types of contact that appear in the contact log (e.g., 'In Person').

    These records map to the RefContactType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefContactTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class ContactTypesDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    A type of contact that appears in the contact log (e.g., 'In Person').

    These records map to the RefContactType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefContactTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class ProgramsList(base_views.ListCreateAPIView):
    """
    The list of programs in which a family may be enrolled.

    These records map to the RefProgram model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefProgramSerializer

    permission_classes = (permissions.IsAuthenticated,)


class ProgramsDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    A program in which a family may be enrolled.

    These records map to the RefProgram model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefProgramSerializer

    permission_classes = (permissions.IsAuthenticated,)


class ServiceLevelsList(generics.ListCreateAPIView):
    """
    An optional set of sub-programs that describe smaller differences in service
    than different programs. (e.g., the program 'Outreach' may have 'Basic' and
    'Intensive' service levels.)

    These records map to the RefServiceLevel model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    One filter is available: ?ref_program=1 returns those service levels linked to the program with
    a ref_program_id of 1.
    """

    serializer_class = RefServiceLevelSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return RefServiceLevel.objects.get_visible(self.request.user)
        else:
            ref_program_filter = self.request.query_params.get('ref_program', None)
            if ref_program_filter:
                return RefServiceLevel.objects.filter(
                    Q(ref_program__universal=True) |
                    Q(ref_program__organization__in=Organization.objects.get_read_orgs(self.request.user))
                ).filter(ref_program=ref_program_filter).order_by('sort_order')
            else:
                return RefServiceLevel.objects.get_visible(self.request.user)

class ServiceLevelsDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    An optional sub-program that describe smaller differences in service
    than different programs. (e.g., the program 'Outreach' may have 'Basic' and
    'Intensive' service levels.)

    These records map to the RefServiceLevel model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefServiceLevelSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return RefServiceLevel.objects.get_visible(self.request.user)


class AttendanceStatusesList(base_views.ListCreateAPIView):
    """
    A list of attendance types: "Attended", "Absent - Sick", etc.

    These records map to the RefAttendanceStatus model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefAttendanceStatusSerializer

    permission_classes = (permissions.IsAuthenticated,)


class AttendanceStatusesDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes an attendance type: "Attended", "Absent - Sick", etc.

    These records map to the RefAttendanceStatus model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefAttendanceStatusSerializer

    permission_classes = (permissions.IsAuthenticated,)



class TransportTypesList(base_views.ListCreateAPIView):
    """
    A list of the transport types available to children (e.g., "Bus").

    These records map to the RefTransportType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefTransportTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class TransportTypesDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a transport type available to children (e.g., "Bus").

    These records map to the RefTransportType model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefTransportTypeSerializer

    permission_classes = (permissions.IsAuthenticated,)



class HomeVisitLocationsList(base_views.ListCreateAPIView):
    """
    A list of locations where a home visit might occur (e.g., "Home", "On-Site")

    These records map to the RefHomeVisitLocation model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefHomeVisitLocationSerializer

    permission_classes = (permissions.IsAuthenticated,)


class HomeVisitLocationsDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a location where a home visit might occur (e.g., "Home", "On-Site")

    These records map to the RefHomeVisitLocation model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefHomeVisitLocationSerializer

    permission_classes = (permissions.IsAuthenticated,)



class ReferredFromList(base_views.ListCreateAPIView):
    """
    A list of sources for client referrals to the agency.

    These records map to the RefReferredFrom model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefReferredFromSerializer

    permission_classes = (permissions.IsAuthenticated,)


class ReferredFromDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a source for client referrals to the agency.

    These records map to the RefReferredFrom model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefReferredFromSerializer

    permission_classes = (permissions.IsAuthenticated,)


class WaitlistStatusList(base_views.ListCreateAPIView):
    """
    Describes the current status of a client on the waitlist.

    These records map to the RefWaitlistStatus model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefWaitlistStatusSerializer

    permission_classes = (permissions.IsAuthenticated,)


class WaitlistStatusDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes the current status of a client on the waitlist.

    These records map to the RefWaitlistStatus model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefWaitlistStatusSerializer

    permission_classes = (permissions.IsAuthenticated,)


class ServiceNeedList(base_views.ListCreateAPIView):
    """
    Describes a service need for a client on the waitlist.

    These records map to the RefServiceNeed model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefServiceNeedSerializer

    permission_classes = (permissions.IsAuthenticated,)


class ServiceNeedDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a service need for a client on the waitlist.

    These records map to the RefServiceNeed model.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.

    Deletion where 'universal' is True requires global_admin membership. Deletion in other cases
    requires membership in the given organization's admin group.
    """

    serializer_class = RefServiceNeedSerializer

    permission_classes = (permissions.IsAuthenticated,)