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

from django.contrib.auth.models import User, Group

from rest_framework import serializers, status
from rest_framework.exceptions import NotAuthenticated, ValidationError, PermissionDenied

from oarndb.serializers import BaseSerializer

from oarndb.models import Organization
from oarndb.models.reference_models import RefAdultChildRelationshipType
from oarndb.models.reference_models import RefLanguage
from oarndb.models.reference_models import RefLanguageUseType
from oarndb.models.reference_models import RefAdultFamilyRelationshipType
from oarndb.models.reference_models import RefChildFamilyRelationshipType
from oarndb.models.reference_models import RefRace
from oarndb.models.reference_models import RefGender
from oarndb.models.reference_models import RefPersonTelephoneNumberType
from oarndb.models.reference_models import RefEmailType
from oarndb.models.reference_models import RefCounty
from oarndb.models.reference_models import RefState
from oarndb.models.reference_models import RefLocationType
from oarndb.models.reference_models import RefRole
from oarndb.models.reference_models import RefContactType
from oarndb.models.reference_models import RefProgram
from oarndb.models.reference_models import RefServiceLevel
from oarndb.models.reference_models import RefAssessmentIntervalType
from oarndb.models.reference_models import RefAttendanceStatus
from oarndb.models.reference_models import RefTransportType
from oarndb.models.reference_models import RefHomeVisitLocation
from oarndb.models.reference_models import RefReferredFrom
from oarndb.models.reference_models import RefServiceNeed
from oarndb.models.reference_models import RefWaitlistStatus


class RefAdultChildRelationshipTypeSerializer(BaseSerializer):
    """
    A list of relationship types, such as 'Biological Mother'.
    """

    class Meta:
        model = RefAdultChildRelationshipType
        fields = (
            'ref_adult_child_relationship_type_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

class RefLanguageSerializer(BaseSerializer):
    """
    A list of languages spoken by clients
    """

    class Meta:
        model = RefLanguage
        fields = (
            'ref_language_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefLanguageUseTypeSerializer(BaseSerializer):
    """
    A CEDS recommended table, but may be more detail than we need.
    A candidate for deletion in the next draft.
    Indicates the context in which a language is used.
    """

    class Meta:
        model = RefLanguageUseType
        fields = (
            'ref_language_use_type_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefAdultFamilyRelationshipTypeSerializer(BaseSerializer):
    """
    Describes the relationship of an adult to a family.
    This may be duplicative, since we often describe an adult's
    relationship with a family based on their relationship with
    the child (e.g., "Parent", "Uncle", "Granparent", etc.). It
    may be enough to indicate primary adult, emergency contact,
    etc., rather than use a title.
    This may be a candidate for deletion in the next draft.
    """

    class Meta:
        model = RefAdultFamilyRelationshipType
        fields = (
            'ref_adult_family_relationship_type_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefChildFamilyRelationshipTypeSerializer(BaseSerializer):
    """
    Describes the relationship of a child to a family, e.g.,
    "Biological Child", "Foster Child", etc.
    """

    class Meta:
        model = RefChildFamilyRelationshipType
        fields = (
            'ref_child_family_relationship_type_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefRaceSerializer(BaseSerializer):
    """
    CEDS and federal guidelines split race off from ethnicity, which
    here is carried in the person table.
    """

    class Meta:
        model = RefRace
        fields = (
            'ref_race_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefGenderSerializer(BaseSerializer):
    """
    Simply a reference/lookup table for gender.
    """

    class Meta:
        model = RefGender
        fields = (
            'ref_gender_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefPersonTelephoneNumberTypeSerializer(BaseSerializer):
    """
    A list of phone types, e.g., "Home", "Cell"
    """

    class Meta:
        model = RefPersonTelephoneNumberType
        fields = (
            'ref_person_telephone_number_type_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefEmailTypeSerializer(BaseSerializer):
    """
    A list of email types, e.g., "Home", "Work"
    """

    class Meta:
        model = RefEmailType
        fields = (
            'ref_email_type_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefCountySerializer(BaseSerializer):
    """
    A list of Oregon county names. A future draft may also link 
    zip codes to these records.
    """

    class Meta:
        model = RefCounty
        fields = (
            'ref_county_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefStateSerializer(BaseSerializer):
    """
    A simple list of US states.
    """

    class Meta:
        model = RefState
        fields = (
            'ref_state_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )
 

class RefLocationTypeSerializer(BaseSerializer):
    """
    A list of housing types: "Residential Home", "Apartment", "Shelter", etc.
    """

    class Meta:
        model = RefLocationType
        fields = (
            'ref_location_type_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

class RefRoleSerializer(BaseSerializer):
    """
    The roles a person may have with an organization are defined here. 
    It must be a wide list.
    """
    
    class Meta:
        model = RefRole
        fields = (
            'ref_role_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefContactTypeSerializer(BaseSerializer):
    """
    For the contact log, was the contact by phone, in person, etc.?
    """

    class Meta:
        model = RefContactType
        fields = (
            'ref_contact_type_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefProgramSerializer(BaseSerializer):
    """
    The list of programs in which a family may be enrolled. Varies by Relief Nursery.
    """

    class Meta:
        model = RefProgram
        fields = (
            'ref_program_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'is_oarn_program',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefServiceLevelSerializer(serializers.ModelSerializer):
    """
    An optional set of sub-programs that describe smaller differences in service
    than different programs. (e.g., the program 'Outreach' may have 'Basic' and 
    'Intensive' service levels.)
    """
    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = RefServiceLevel
        fields = (
            'ref_service_level_id',
            'ref_program',
            'code',
            'description',
            'sort_order',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

    def update(self, instance, validated_data):
        # Does the user have update rights to the related program?

        request = self.context.get('request', None)

        if request is not None:
            error_msg = "User has insufficient rights for this update operation."
            if instance.ref_program.universal:
                if not request.user.groups.filter(name='global_admin').count() > 0:
                    raise PermissionDenied(detail=error_msg)
            else:
                if instance.ref_program.organization not in Organization.objects.get_admin_orgs(request.user):
                    raise PermissionDenied(detail=error_msg)

            # If an error hasn't been raised yet, we can update:
            instance.modified_by = request.user
            return super(RefServiceLevelSerializer, self).update(instance, validated_data)

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def create(self, validated_data):
        # Does the user have admin rights to the related program?
        request = self.context.get('request', None)

        if request is not None:
            error_msg = "User has insufficient rights for this update operation."

            ref_program = validated_data.get("ref_program", None)
            if ref_program is not None:
                if ref_program.universal:
                    if not request.user.groups.filter(name='global_admin').count() > 0:
                        raise PermissionDenied(detail=error_msg)
                else:
                    if ref_program.organization not in Organization.objects.get_admin_orgs(request.user):
                        raise PermissionDenied(detail=error_msg)
                # If an error hasn't been raised yet, we can update:
                validated_data["created_by"] = request.user
                return super(RefServiceLevelSerializer, self).create(validated_data)
            else:
                raise ValidationError(detail="The ref_role field is required.")

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def is_read_only(self, obj):
        """
        Determines whether the given user has read or write access to the record.
        """
        request = self.context.get('request', None)

        if request is not None:
            if obj.ref_program.universal:
                if request.user.groups.filter(name='global_admin').count() > 0:
                    return True
                else:
                    return False
            else:
                if obj.ref_program.organization in Organization.objects.get_admin_orgs(request.user):
                    return True
                else:
                    return False

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

class RefAssessmentIntervalTypeSerializer(BaseSerializer):
    """
    A list of the different types of assessment interval.
    """

    class Meta:
        model = RefAssessmentIntervalType
        fields = (
            'ref_assessment_interval_type_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

class RefAttendanceStatusSerializer(BaseSerializer):
    """
    A list of attendance types: "Attended", "Absent - Sick", etc.
    """

    class Meta:
        model = RefAttendanceStatus
        fields = (
            'ref_attendance_status_id',
            'excused',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefTransportTypeSerializer(BaseSerializer):
    """
    What options does a child have for arriving at class? May be a bus number, 
    'Self-Transport', etc.
    """

    class Meta:
        model = RefTransportType
        fields = (
            'ref_transport_type_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefHomeVisitLocationSerializer(BaseSerializer):
    """
    Where did the visit occur? Home, on-site, other?
    """

    class Meta:
        model = RefHomeVisitLocation
        fields = (
            'ref_home_visit_location_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefReferredFromSerializer(BaseSerializer):
    """
    A list of sources for client referrals to the agency.
    """

    class Meta:
        model = RefReferredFrom
        fields = (
            'ref_referred_from_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefServiceNeedSerializer(BaseSerializer):
    """
    Describes a service needed by a family on the waitlist.
    """

    class Meta:
        model = RefServiceNeed
        fields = (
            'ref_service_need_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefWaitlistStatusSerializer(BaseSerializer):
    """
    Describes the status of a family on the waitlist.
    """

    class Meta:
        model = RefWaitlistStatus
        fields = (
            'ref_waitlist_status_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )