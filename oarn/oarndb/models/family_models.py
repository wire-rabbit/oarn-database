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
from rest_framework import status

from oarndb.models.base_model import BaseModel
from oarndb.models import Organization, OrganizationPersonRole


class Person(BaseModel):
    """
    The most important table of the whole system. 
    All children, adults, and staff have a person record.
    """

    person_id = models.AutoField('person_id', primary_key=True)

    first_name = models.CharField('first_name', max_length=35, null=False)

    middle_name = models.CharField('middle_name', max_length=35, null=True, blank=True)

    last_name = models.CharField('last_name', max_length=35, null=False)

    # 'Jr.', 'III', etc.
    generation_code = models.CharField('generation_code', max_length=10, null=True, blank=True)

    prefix = models.CharField('prefix', max_length=30, null=True, blank=True)

    birth_date = models.DateField('birth_date', auto_now=False, auto_now_add=False, null=True, blank=True)

    ref_gender = models.ForeignKey('RefGender', verbose_name='ref_gender',
                                   blank=True, null=True, on_delete=models.SET_NULL)

    organization = models.ManyToManyField(Organization, through='OrganizationPersonRole', related_name='organizations')

    def get_instance_access(self, user):
        """
        Returns the read/write access for this instance and this user.

        :param user: django.contrib.auth.models.User
        :return: {read: Boolean, write: Boolean}
        """
        # Global admins can read anything:
        if user.groups.filter(name='global_admin').count() > 0:
            return {'read': True, 'write': True}
        # Does the user have admin or read/write access to this Person's org?
        elif (Organization.objects.get_readwrite_orgs(user) & self.organization.all()).count() > 0:
            return {'read': True, 'write': True}
        # Does the user have read-only rights to this Person's org?
        elif (Organization.objects.get_read_orgs(user) & self.organization.all()).count() > 0:
            return {'read': True, 'write': False}
        # If nothing else, is the user a member of global_readonly?
        elif user.groups.filter(name='global_readonly').count() > 0:
            return {'read': True, 'write': False}
        else:
            return {'read': False, 'write': False}

    @staticmethod
    def get_validated_data_access(user, validated_data):
        """
        Returns details on whether the supplied user has the write permissions needed
        to update/create with this validated_data

        As a model with a many-to-many relationship, Person requires a POST with

        :param user: django.contrib.auth.models.User
        :param validated_data: from the serializer
        :return: {write:Boolean, error: Boolean, error_msg: String, status_code: rest_framework.status}
        """
        # Creating a person record requires only that the user has *some* writable permissions.
        # The key will be in the linking of the new Person record with an organization, which must
        # be done via a POST to the OrganizationPersonRole view - without that, the new Person record
        # will not be visible to the user who created it. (This is not an ideal way to approach this,
        # in my view - we should be able to POST nested JSON data to a single endpoint and have the
        # nested data result in new records in both tables, but DRF currently appears only to support
        # hackish solutions to this problem, so we'll do it in two POSTs to two endpoints for now.)
        # Once a Person record is linked to an organization, updates require write access to that
        # organization.

        # Does the validated data reference an existing record?
        pk = validated_data.get('person_id')
        if pk is None:
            return {'write':False, 'error': True, 'error_msg': 'it is None!', 'status_code': status.HTTP_400_BAD_REQUEST}
        else:
            return {'write':False, 'error': True, 'error_msg': pk, 'status_code': status.HTTP_400_BAD_REQUEST}

    class Meta:
        db_table = "person"
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return self.first_name + " " + self.last_name + " (" + str(self.person_id) + ")"


class Child(BaseModel):
    """
    Allows us to separate children from the set of person records.
    """

    person = models.OneToOneField('Person', primary_key=True, verbose_name='person')

    class Meta:
        db_table = "child"

    def __str__(self):
        return self.person.__str__()


class Adult(BaseModel):
    """
    Allows us to separate adults from the set of person records.
    """

    person = models.OneToOneField('Person', primary_key=True, verbose_name='person')

    class Meta:
        db_table = "adult"

    def __str__(self):
        return self.person.__str__()


class PersonRace(BaseModel):
    """
    The federal categories for race.
    """

    person = models.OneToOneField('Person', primary_key=True, verbose_name='person')

    hispanic_latino_ethnicity = models.BooleanField('hispanic_latino_ethnicity', default=False)

    american_indian = models.BooleanField(default=False)

    asian = models.BooleanField(default=False)

    black = models.BooleanField(default=False)

    pacific = models.BooleanField(default=False)

    white = models.BooleanField(default=False)

    multiracial = models.BooleanField(default=False)

    unreported = models.BooleanField(default=False)

    other = models.BooleanField(default=False)

    other_details = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = "person_race"

    def __str__(self):
        race_list = ""

        if self.american_indian:
            race_list = race_list + 'american_indian; '

        if self.asian:
            race_list = race_list + 'asian; '

        if self.black:
            race_list = race_list + 'black; '

        if self.pacific:
            race_list = race_list + 'pacific; '

        if self.white:
            race_list = race_list + 'white; '

        if self.other:
            race_list = race_list + 'other; '

        return self.person.__str__() + ': ' + race_list


class Family(BaseModel):
    """
    The family table acts as a hub around which any number of person 
    records may be associated.
    """

    family_id = models.AutoField('family_id', primary_key=True)

    notes = models.CharField('notes', max_length=10000, null=True, blank=True)

    organizations = models.ManyToManyField("Organization", through="OrganizationFamilyLink")

    class Meta:
        db_table = "family"

    def __str__(self):
        return str(self.family_id)


class AdultFamilyRelationship(BaseModel):
    """
    Describes a relationship between an individual adult and a family.
    """

    adult_family_relationship_id = models.AutoField('adult_family_relationship_id', primary_key=True)

    adult = models.ForeignKey('Adult', verbose_name='adult')

    family = models.ForeignKey('Family', verbose_name='family')

    ref_adult_family_relationship_type = models.ForeignKey(
        'RefAdultFamilyRelationshipType',
        verbose_name='ref_adult_family_relationship_type_id',
        null=True,  # This may not be a necessary field at all, so nullable for now
        blank=True,
        on_delete=models.SET_NULL
    )

    primary_adult = models.BooleanField('primary_adult', default=False)

    relationship_begin_date = models.DateField(
        'relationship_begin_date',
        auto_now=False,
        auto_now_add=False,
        null=True,
        blank=True
    )

    relationship_end_date = models.DateField(
        'relationship_end_date',
        auto_now=False,
        auto_now_add=False,
        null=True,
        blank=True
    )

    notes = models.CharField('notes', max_length=10000, null=True, blank=True)

    class Meta:
        db_table = 'adult_family_relationship'

    def __str__(self):
        return self.adult.__str__() + ' linked to family ' + self.family.__str__()


class ChildFamilyRelationship(BaseModel):
    """
    Describes a relationship between an individual child and a family.
    This is where foster or adoptive relationships can be modeled.
    """

    child_family_relationship_id = models.AutoField('child_family_relationship_id', primary_key=True)

    child = models.ForeignKey('Child', verbose_name='child')

    family = models.ForeignKey('Family', verbose_name='family')

    ref_child_family_relationship_type = models.ForeignKey(
        'RefChildFamilyRelationshipType',
        verbose_name='ref_child_family_relationship_type',
        blank=True,
        null=True,
        on_delete=models.SET_NULL
    )

    relationship_begin_date = models.DateField(
        'relationship_begin_date',
        auto_now=False,
        auto_now_add=False,
        null=True,
        blank=True
    )

    relationship_end_date = models.DateField(
        'relationship_end_date',
        auto_now=False,
        auto_now_add=False,
        null=True,
        blank=True
    )

    notes = models.CharField('notes', max_length=10000, null=True, blank=True)

    class Meta:
        db_table = 'child_family_relationship'

    def __str__(self):
        return self.child.__str__() + ' linked to family ' + self.family.__str__()


class AdultChildRelationship(BaseModel):
    """
    Describes the relationship between a given adult and a given child.
    """
    adult_child_relationship_id = models.AutoField('adult_child_relationship_id', primary_key=True)

    adult = models.ForeignKey('Adult', verbose_name='adult')

    child = models.ForeignKey('Child', verbose_name='child')

    ref_adult_child_relationship_type = models.ForeignKey(
        'RefAdultChildRelationshipType',
        verbose_name='ref_adult_child_relationship_type',
        blank=True,
        null=True,
        on_delete=models.SET_NULL
    )

    can_pick_up = models.BooleanField('can_pick_up', default=True)  # Do we want to whitelist?

    legal_custody = models.BooleanField('legal_custody', default=True)  # Do we want to whitelist?

    physical_custody = models.BooleanField('physical_custody', default=True)  # Do we want to whitelist?

    relationship_begin_date = models.DateField(
        'relationship_begin_date',
        auto_now=False,
        auto_now_add=False,
        null=True,
        blank=True
    )

    relationship_end_date = models.DateField(
        'relationship_end_date',
        auto_now=False,
        auto_now_add=False,
        null=True,
        blank=True
    )

    notes = models.CharField('notes', max_length=10000)

    class Meta:
        db_table = 'adult_child_relationship'

    def __str__(self):
        return self.adult.__str__() + ' linked to child ' + self.child.__str__()


class PersonDemographicRace(BaseModel):
    """
    A lookup table for race as opposed to ethnicity, following CEDS and the 
    federal guidelines.
    """

    person_demographic_race_id = models.AutoField('person_demographic_race_id', primary_key=True)

    person = models.ForeignKey('Person', verbose_name='person')

    ref_race = models.ForeignKey('RefRace', verbose_name='ref_race',
                                 blank=True, null=True, on_delete=models.SET_NULL)

    class Meta:
        db_table = 'person_demographic_race'

        # a person cannot be a given race multiple times:
        unique_together = (("person", "ref_race"))

    def __str__(self):
        return self.person.__str__() + ': ' + self.ref_race.__str__()


class PersonLanguage(BaseModel):
    """
    Represents a language spoken by a person.
    """

    person_language_id = models.AutoField('person_language_id', primary_key=True)

    person = models.ForeignKey('Person', verbose_name='person')

    ref_language = models.ForeignKey('RefLanguage', verbose_name='ref_language_id',
                                     blank=True, null=True, on_delete=models.SET_NULL)

    other_details = models.CharField(max_length=100, null=True, blank=True)

    ref_language_use_type = models.ForeignKey(
        'RefLanguageUseType',
        verbose_name='ref_language_use_type',
        blank=True,
        null=True,
        on_delete=models.SET_NULL
    )

    class Meta:
        db_table = 'person_language'

        # a person cannot be assigned the same language twice:
        unique_together = (("person", "ref_language"))

    def __str__(self):
        return self.person.__str__() + ': ' + self.ref_language.__str__() \
               + ' at ' + self.ref_language_use_type.__str__()


class PersonPregnancy(BaseModel):
    """
    An adult may be associated with a pregancy record.
    """

    person_pregnancy_id = models.AutoField('person_pregnancy_id', primary_key=True)

    adult = models.ForeignKey('Adult', verbose_name='adult')

    pregnancy_end_date = models.DateField(
        'pregnancy_end_date',
        auto_now=False,
        auto_now_add=False,
        null=True,
        blank=True
    )

    pregnancy_notes = models.CharField('pregnancy_notes', max_length=5000)

    class Meta:
        db_table = 'person_pregnancy'

    def __str__(self):
        return self.adult.__str__() + ': person_pregnancy_id (' + \
               str(self.person_pregnancy_id) + ')'


class ChildPregnancyRelationship(BaseModel):
    """
    A pregnancy may result in more than one child.
    """

    child_pregnancy_relationship_id = models.AutoField(
        'child_pregnancy_relationship_id',
        primary_key=True
    )

    person_pregnancy = models.ForeignKey(
        "PersonPregnancy",
        verbose_name='person_pregnancy'
    )

    child = models.ForeignKey(
        "Child",
        verbose_name='child'
    )

    class Meta:
        db_table = 'child_pregnancy_relationship'

    def __str__(self):
        return self.child.__str__() + ': ' + \
               self.person_pregnancy.__str__()


class PersonTelephone(BaseModel):
    """
    A person may be linked to zero or more telephone numbers.
    """

    person_telephone_id = models.AutoField(
        'person_telephone_id',
        primary_key=True
    )

    person = models.ForeignKey("Person", verbose_name='person')

    telephone_number = models.CharField('telephone_number', max_length=24, null=False, blank=False)

    ref_person_telephone_number_type = models.ForeignKey(
        "RefPersonTelephoneNumberType",
        verbose_name='ref_person_telephone_number_type_id',
        blank=True,
        null=True,
        on_delete=models.SET_NULL
    )

    class Meta:
        db_table = 'person_telephone'

    def __str__(self):
        return self.person.__str__() + ': ' + self.telephone_number + \
               ' (' + self.ref_person_telephone_number_type.__str__() + ')'


class PersonEmailAddress(BaseModel):
    """
    A person may be linked to zero or more email addresses.
    """

    person_email_address_id = models.AutoField(
        'person_email_address_id',
        primary_key=True
    )

    person = models.ForeignKey("Person", verbose_name='person')

    email_address = models.EmailField('email_address', max_length=75)

    ref_email_type = models.ForeignKey("RefEmailType", verbose_name='ref_email_type',
                                       blank=True, null=True)

    class Meta:
        db_table = 'person_email_address'

    def __str__(self):
        return self.person.__str__() + ': ' + self.email_address + \
               ' (' + self.ref_email_type.__str__() + ')'


class FamilyAddress(BaseModel):
    """
    A family may be lined to zero or more physical/mailing addresses.
    """
    family_address_id = models.AutoField('family_address_id', primary_key=True)

    family = models.ForeignKey("Family", verbose_name='family')

    ref_location_type = models.ForeignKey(
        "RefLocationType",
        verbose_name='ref_location_type',
        blank=True,
        null=True,
        on_delete=models.SET_NULL
    )

    street_number_and_name = models.CharField('street_number_and_name', max_length=40)

    apartment_room_or_suite_number = models.CharField(
        'apartment_room_or_suite_number',
        max_length=30,
        null=True,
        blank=True
    )

    city = models.CharField('city', max_length=30)

    ref_state = models.ForeignKey(
        "RefState",
        verbose_name='ref_state',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    postal_code = models.CharField('postal_code', max_length=17, null=True, blank=True)

    # Dropped from the SQL 'address_county_name' - this should be solely by reference table lookup.
    ref_county = models.ForeignKey("RefCounty", verbose_name='ref_county',
                                   blank=True, null=True, on_delete=models.SET_NULL)

    residence_end_date = models.DateField(
        'residence_end_date',
        auto_now=False,
        auto_now_add=False,
        null=True,
        blank=True
    )

    # Should this address appear in the family summary view?
    primary_address = models.BooleanField('primary_address', default=False)

    notes = models.CharField('notes', max_length=10000, blank=True, null=True)

    class Meta:
        db_table = 'family_address'

    def __str__(self):
        return 'Family ID ' + self.family.__str__() + ': ' +  self.street_number_and_name
