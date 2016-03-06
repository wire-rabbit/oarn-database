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

import copy

from django.db.models import Q

from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError

from oarndb.models import Family, AdultFamilyRelationship, ChildFamilyRelationship
from oarndb.models import Adult, Child, Person, Organization
from oarndb.models import RefAdultFamilyRelationshipType, RefChildFamilyRelationshipType
from oarndb.models import OrganizationFamilyLink, OrganizationPersonRole
from oarndb.models import FamilyEnrollment, PersonEnrollment, ServiceLevelEnrollment
from oarndb.models import RefRole, RefServiceLevel, RefProgram


class FilteredPersonSerializer(serializers.ListSerializer):
    """
    This is used in the NestedPersonSerializer, overriding the 'to-many' functionality
    of that serializer to be certain that no person the user lacks read access to
    are returned.
    """

    def to_representation(self, data):

        request = self.context.get('request', None)
        if request:
            data = data.filter(
                person__organization__in=Organization.objects.get_read_orgs(request.user)
            )
            return super(FilteredPersonSerializer, self).to_representation(data)
        else:
            raise ValidationError(detail="No request context was provided.")

class FilteredChildFamilyRelationshipSerializer(serializers.ListSerializer):
    """
    The FamilyListSerializer uses NestedChildFamilyRelationshipSerializer to describe
    the children linked to the family. It's necessary to override the 'to-many' functionality
    of that serializer to be certain that no children the user lacks read access to
    are returned.
    """

    def to_representation(self, data):

        request = self.context.get('request', None)
        if request:
            data = data.filter(
                child__person__organization__in=Organization.objects.get_read_orgs(request.user)
            )
            return super(FilteredChildFamilyRelationshipSerializer, self).to_representation(data)
        else:
            raise ValidationError(detail="No request context was provided.")


class FilteredAdultFamilyRelationshipSerializer(serializers.ListSerializer):
    """
    The FamilyListSerializer uses NestedAdultFamilyRelationshipSerializer to describe
    the adults linked to the family. It's necessary to override the 'to-many' functionality
    of that serializer to be certain that no adults the user lacks read access to
    are returned.
    """

    def to_representation(self, data):

        request = self.context.get('request', None)
        if request:
            data = data.filter(
                adult__person__organization__in=Organization.objects.get_read_orgs(request.user)
            )
            return super(FilteredAdultFamilyRelationshipSerializer, self).to_representation(data)
        else:
            raise ValidationError(detail="No request context was provided.")


class FilteredOrganizationSerializer(serializers.ListSerializer):
    """
    The FamilyListSerializer uses NestedOrganizationSerializer to describe the organizations
    the family is linked to. It's necessary to override the 'to-many' functionality of that
    serializer to be certain that no organizations the user lacks read access to are returned.
    """

    def to_representation(self, data):

        request = self.context.get('request', None)
        if request:
            data = data.filter(
                organization_id__in=Organization.objects.get_read_orgs(request.user)
            )
            return super(FilteredAdultFamilyRelationshipSerializer, self).to_representation(data)
        else:
            raise ValidationError(detail="No request context was provided.")


class FilteredAdultOrChildSerializer(serializers.ListSerializer):

    def to_representation(self, data):

        request = self.context.get('request', None)
        if request:
            data = data.filter(
                person__organization__in=Organization.objects.get_read_orgs(request.user)
            )
            return super(FilteredAdultFamilyRelationshipSerializer, self).to_representation(data)
        else:
            raise ValidationError(detail="No request context was provided.")


class FilteredRefRoleSerializer(serializers.ListSerializer):

    def to_representation(self, data):
        request = self.context.get('request', None)
        if request:
            data = data.filter(
                Q(universal=True) |
                Q(organization__in=Organization.objects.get_read_orgs(request.user))
            )
            return super(FilteredRefRoleSerializer, self).to_representation(data)
        else:
            raise ValidationError(detail="No request context was provided.")


class NestedRefRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RefRole

        list_serializer_class = FilteredRefRoleSerializer

        fields = (
            'ref_role_id',
            'description',
            'code',
            'sort_order'
        )

class NestedPersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person

        fields = (
            'person_id',
            'first_name',
            'last_name',
        )


class NestedChildSerializer(serializers.ModelSerializer):
    person = NestedPersonSerializer()

    class Meta:
        model = Child

        list_serializer_class = FilteredAdultOrChildSerializer

        fields = (
            'person',
        )


class NestedAdultSerializer(serializers.ModelSerializer):
    person = NestedPersonSerializer()

    class Meta:
        model = Adult

        list_serializer_class = FilteredAdultOrChildSerializer

        fields = (
            'person',
        )


class NestedChildFamilyRelationshipSerializer(serializers.ModelSerializer):
    """
    Allows the family views to present more information about linked children.
    Not used for updating.
    """

    child = NestedChildSerializer()

    class Meta:
        model = ChildFamilyRelationship

        list_serializer_class = FilteredChildFamilyRelationshipSerializer

        fields = (
            'child_family_relationship_id',
            'child',
            'family',
            'ref_child_family_relationship_type',
            'relationship_begin_date',
            'relationship_end_date',
            'notes'
        )


class NestedAdultFamilyRelationshipSerializer(serializers.ModelSerializer):
    """
    Allows the family views to present more information about linked adults.
    Not used for updating.
    """

    adult = NestedAdultSerializer()

    class Meta:
        model = AdultFamilyRelationship

        list_serializer_class = FilteredAdultFamilyRelationshipSerializer

        fields = (
            'adult_family_relationship_id',
            'adult',
            'family',
            'ref_adult_family_relationship_type',
            'primary_adult',
            'relationship_begin_date',
            'relationship_end_date',
            'notes'
        )


class NestedOrganizationSerializer(serializers.ModelSerializer):
    """
    Allows the family views to present more information about linked organizations.
    Not used for updating.
    """
    class Meta:
        model = Organization

        fields = (
            'organization_id',
            'name',
            'short_name'
        )


class NestedOrganizationPersonRoleSerializer(serializers.ModelSerializer):
    """
    The link between a Person and an Organization, defined by a Role.
    This nested version lacks a `person` FK, since that will be supplied by the
    parent Person serializer.
    """

    ref_role = NestedRefRoleSerializer()

    class Meta:
        model = OrganizationPersonRole

        fields = (
            'organization_person_role_id',
            'organization',
            'ref_role',
            'entry_date',
            'exit_date',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by'
        )


class NestedPersonEnrollmentSerializer(serializers.ModelSerializer):

    person = NestedPersonSerializer()

    class Meta:
        model = PersonEnrollment

        fields = (
            'person_enrollment_id',
            'person',
            'family_enrollment',
            'open_date',
            'close_date'
        )


class NestedRefProgramSerializer(serializers.ModelSerializer):

    class Meta:
        model = RefProgram

        fields = (
            'ref_program_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'is_oarn_program'
        )

class NestedRefServiceLevelSerializer(serializers.ModelSerializer):

    ref_program = NestedRefProgramSerializer()

    class Meta:
        model = RefServiceLevel

        fields = (
            'ref_service_level_id',
            'ref_program',
            'code',
            'description',
            'sort_order',
            'definition'
        )

class NestedServiceLevelEnrollmentSerializer(serializers.ModelSerializer):

    ref_service_level = NestedRefServiceLevelSerializer()

    class Meta:
        model = ServiceLevelEnrollment

        fields = (
            'service_level_enrollment_id',
            'family_enrollment',
            'ref_service_level',
            'open_date',
            'close_date'
        )