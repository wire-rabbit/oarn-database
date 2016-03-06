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

from django.db import models
from django.db.models import Q

from rest_framework import status

from oarndb.models.base_model import BaseModel
from oarndb.models.org_models import Organization


class RefModelManager(models.Manager):
    """
    Adds a means to return only those records a given user has access to.
    """

    def get_visible(self, user):
        """
        Returns a queryset containing only those records the supplied user has access to.

        :param user: django.contrib.auth.models.User
        :return: queryset
        """
        return super(RefModelManager, self).get_queryset().filter(
            Q(organization__in=Organization.objects.get_read_orgs(user)) |
            Q(universal=True)
        ).order_by('sort_order')


class RefModel(BaseModel):
    """
    A set of common model attributes for reference/lookup tables.
    """

    # the description is what appears in a select list
    description = models.CharField(
        'description',
        max_length=100,
        null=False
    )

    # the code is a potentially shorter version of the description
    code = models.CharField(
        'code',
        max_length=50,
        null=False
    )

    # the definition provides a fuller explanation of the entry
    definition = models.CharField(
        'definition',
        max_length=4000,
        null=True,
        blank=True
    )

    # the sort_order is what controls the order of items in a select list
    sort_order = models.DecimalField(
        'sort_order',
        max_digits=5,
        decimal_places=2,
        null=False
    )

    # will this appear in the dropdown list for every agency?
    universal = models.BooleanField('universal', default=False)

    # a link to a specific organization if this is a one-off item
    # (a many-to-many is excessive here - most values should be universal
    # and if there's duplication across individual orgs probably
    # the semantics will vary as well (so we'll need different definitions).
    organization = models.ForeignKey(
        "Organization",
        verbose_name='organization',
        null=True,
        blank=True
    )

    objects = RefModelManager()

    def get_instance_access(self, user):
        """
        Returns the read/write access for this instance and this user.

        :param user: django.contrib.auth.models.User
        :return: {read: Boolean, write: Boolean}
        """

        # if universal, read access is true, write access requires global admin:
        if self.universal:
            if user.groups.filter(name='global_admin').count() > 0:
                return {'read': True, 'write': True}
            else:
                return {'read': True, 'write': False}
        # if not universal, read/write access is based on the organization:
        else:
            if self.organization in Organization.objects.get_admin_orgs(user):
                return {'read': True, 'write': True}
            elif self.organization in Organization.objects.get_readwrite_orgs(user):
                return {'read': True, 'write': True}
            elif self.organization in Organization.objects.get_read_orgs(user):
                return {'read': True, 'write': False}
            else:
                return {'read': False, 'write': False}

    @staticmethod
    def get_validated_data_access(user, validated_data):
        """
        Returns details on whether the supplied user has the write permissions needed
        to update/create with this validated_data

        :param user: django.contrib.auth.models.User
        :param validated_data: from the serializer
        :return: {write:Boolean, error: Boolean, error_msg: String, status_code: rest_framework.status}
        """

        # both universal and organization cannot be set:
        # are both universal and organization set? (this is not allowed)
        if validated_data.get('universal') and validated_data.get('organization'):
            error_msg = "Organization and universal cannot both be set."
            return {'write': False, 'error': True, 'error_msg': error_msg, 'status_code': status.HTTP_400_BAD_REQUEST}

        # either universal or organization must be set.
        if not validated_data.get('universal') and not validated_data.get('organization'):
            error_msg = "Either organization or universal must be set."
            return {'write': False, 'error': True, 'error_msg': error_msg, 'status_code': status.HTTP_400_BAD_REQUEST}

        # if universal is set, user must be a member of the global admins
        if validated_data.get('universal'):
            if user.groups.filter(name='global_admin').count() > 0:
                return {'write': True, 'error': False, 'error_msg': None, 'status_code': None}
            else:
                error_msg = "Setting universal=True requires global admin rights."
                return {'write': False, 'error': True, 'error_msg': error_msg, 'status_code': status.HTTP_403_FORBIDDEN}

        # if organization is set, user must be a member of the org admins
        elif validated_data.get('organization'):
            if validated_data.get('organization') in Organization.objects.get_admin_orgs(user):
                return {'write': True, 'error': False, 'error_msg': None, 'status_code': None}
            else:
                error_msg = "Setting the record to this organization requires organization admin rights."
                return {'write': False, 'error': True, 'error_msg': error_msg, 'status_code': status.HTTP_403_FORBIDDEN}

        # We should not reach this point, so return an error if we do:
        return {'write': False, 'error': True, 'error_msg': 'get_validated_data_access error',
                'status_code': status.HTTP_400_BAD_REQUEST}

    class Meta:
        abstract = True
        ordering = ["sort_order"]

    def __str__(self):
        return self.description


class RefAdultChildRelationshipType(RefModel):
    """
    A list of relationship types, such as 'Biological Mother'.
    """

    ref_adult_child_relationship_type_id = models.AutoField(
        'ref_adult_child_relationship_type_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_adult_child_relationship_type"


class RefLanguage(RefModel):
    """
    A list of languages spoken by clients
    """

    ref_language_id = models.AutoField(
        'ref_language_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_language"


class RefLanguageUseType(RefModel):
    """
    A CEDS recommended table, but may be more detail than we need.
    A candidate for deletion in the next draft.
    Indicates the context in which a language is used.
    """

    ref_language_use_type_id = models.AutoField(
        'ref_language_use_type_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_language_use_type"


class RefAdultFamilyRelationshipType(RefModel):
    """
    Describes the relationship of an adult to a family.
    This may be duplicative, since we often describe an adult's
    relationship with a family based on their relationship with
    the child (e.g., "Parent", "Uncle", "Granparent", etc.). It
    may be enough to indicate primary adult, emergency contact,
    etc., rather than use a title.
    This may be a candidate for deletion in the next draft.
    """

    ref_adult_family_relationship_type_id = models.AutoField(
        'ref_adult_family_relationship_type_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_adult_family_relationship_type"


class RefChildFamilyRelationshipType(RefModel):
    """
    Describes the relationship of a child to a family, e.g.,
    "Biological Child", "Foster Child", etc.
    """

    ref_child_family_relationship_type_id = models.AutoField(
        'ref_child_family_relationship_type_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_child_family_relationship_type"


class RefRace(RefModel):
    """
    CEDS and federal guidelines split race off from ethnicity, which
    here is carried in the person table.
    """

    ref_race_id = models.AutoField(
        'ref_race_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_race"


class RefGender(RefModel):
    """
    Simply a reference/lookup table for gender.
    """

    ref_gender_id = models.AutoField(
        'ref_gender_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_gender"


class RefPersonTelephoneNumberType(RefModel):
    """
    A list of phone types, e.g., "Home", "Cell"
    """

    ref_person_telephone_number_type_id = models.AutoField(
        'ref_person_telephone_number_type_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_person_telephone_number_type"


class RefEmailType(RefModel):
    """
    A list of email types, e.g., "Home", "Work"
    """

    ref_email_type_id = models.AutoField(
        'ref_email_type_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_email_type"


class RefCounty(RefModel):
    """
    A list of Oregon county names. A future draft may also link 
    zip codes to these records.
    """

    ref_county_id = models.AutoField(
        'ref_county_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_county"


class RefState(RefModel):
    """
    A simple list of US states.
    """

    ref_state_id = models.AutoField(
        'ref_state_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_state"


class RefLocationType(RefModel):
    """
    A list of housing types: "Residential Home", "Apartment", "Shelter", etc.
    """

    ref_location_type_id = models.AutoField(
        "ref_location_type_id",
        primary_key=True
    )

    class Meta:
        db_table = "ref_location_type"


class RefRole(RefModel):
    """
    The roles a person may have with an organization are defined here. 
    It must be a wide list.
    """

    ref_role_id = models.AutoField(
        "ref_role_id",
        primary_key=True
    )

    class Meta:
        db_table = "ref_role"


class RefContactType(RefModel):
    """
    For the contact log, was the contact by phone, in person, etc.?
    """

    ref_contact_type_id = models.AutoField(
        "ref_contact_type_id",
        primary_key=True
    )

    class Meta:
        db_table = "ref_contact_type"


class RefProgram(RefModel):
    """
    The list of programs in which a family may be enrolled. Varies by Relief Nursery. 
    """

    ref_program_id = models.AutoField('ref_program_id', primary_key=True)

    is_oarn_program = models.BooleanField(default=False)

    is_home_based = models.BooleanField(default=False)

    class Meta:
        db_table = "ref_program"


class RefServiceLevelManager(models.Manager):
    """
    Adds a means to return only those records a given user has access to.
    """

    def get_visible(self, user):
        """
        Returns a queryset containing only those records the supplied user has access to.

        :param user: django.contrib.auth.models.User
        :return: queryset
        """
        return super(RefServiceLevelManager, self).get_queryset().filter(
            Q(ref_program__organization__in=Organization.objects.get_read_orgs(user)) |
            Q(ref_program__universal=True)
        ).order_by('sort_order')

class RefServiceLevel(BaseModel):
    """
    An optional set of sub-programs that describe smaller differences in service
    than different programs. (e.g., the program 'Outreach' may have 'Basic' and 
    'Intensive' service levels.)

    This differs from other reference models in that it lacks the organization
    and universal fields. Access is determined based on its associated
    ref_program value.
    """

    ref_service_level_id = models.AutoField('ref_service_level_id', primary_key=True)

    ref_program = models.ForeignKey("RefProgram", verbose_name='ref_program', null=False)

    # the description is what appears in a select list
    description = models.CharField(
        'description',
        max_length=100,
        null=False
    )

    # the code is a potentially shorter version of the description
    code = models.CharField(
        'code',
        max_length=50,
        null=False
    )

    # the definition provides a fuller explanation of the entry
    definition = models.CharField(
        'definition',
        max_length=4000,
        null=True,
        blank=True
    )

    # the sort_order is what controls the order of items in a select list
    sort_order = models.DecimalField(
        'sort_order',
        max_digits=5,
        decimal_places=2,
        null=False
    )

    objects = RefServiceLevelManager()

    class Meta:
        db_table = "ref_service_level"

    def __str__(self):
        return self.description


class RefAssessmentIntervalType(RefModel):
    """
    A list of the different types of assessment interval.
    """

    ref_assessment_interval_type_id = models.AutoField('ref_assessment_interval_type_id', primary_key=True)

    class Meta:
        db_table = 'ref_assessment_interval_type'


class RefAttendanceStatus(RefModel):
    """
    A list of attendance types: "Attended", "Absent - Sick", etc.
    """

    ref_attendance_status_id = models.AutoField('ref_attendance_status_id', primary_key=True)

    # For reporting, does this tpe indicate an excused absence?
    excused = models.BooleanField('excused', default=False)

    class Meta:
        db_table = 'ref_attendance_status'


class RefTransportType(RefModel):
    """
    What options does a child have for arriving at class? May be a bus number, 'Self-Transport', etc.
    """

    ref_transport_type_id = models.AutoField('ref_transport_type_id', primary_key=True)

    class Meta:
        db_table = 'ref_transport_type'


class RefHomeVisitLocation(RefModel):
    """
    Where did the visit occur? Home, on-site, other?
    """

    ref_home_visit_location_id = models.AutoField('ref_home_visit_location_id', primary_key=True)

    class Meta:
        db_table = 'ref_home_visit_location'


class RefReferredFrom(RefModel):
    """
    A list of sources for client referrals to the agency.
    """

    ref_referred_from_id = models.AutoField('ref_referred_from_id', primary_key=True)

    class Meta:
        db_table = 'ref_referred_from'


class RefWaitlistStatus(RefModel):
    """
    Describes the status of a family on the waitlist.
    """

    ref_waitlist_status_id = models.AutoField('ref_waitlist_status_id', primary_key=True)

    class Meta:
        db_table = 'ref_waitlist_status'


class RefServiceNeed(RefModel):
    """
    Describes a service needed by a family on the waitlist.
    """

    ref_service_need_id = models.AutoField('ref_service_need_id', primary_key=True)

    class Meta:
        db_table = 'ref_service_need'