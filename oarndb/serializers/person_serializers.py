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

from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied, ValidationError

from oarndb.models import Person, Organization, OrganizationPersonRole, RefRole
from oarndb.models import Adult, Child

from oarndb.serializers import NestedOrganizationPersonRoleSerializer


class PersonListSerializer(serializers.ModelSerializer):
    """
    Describes a client or staff person.
    """
    read_only = serializers.SerializerMethodField('is_read_only')

    organization = NestedOrganizationPersonRoleSerializer(source='organizationpersonrole_set', many=True)

    class Meta:
        model = Person
        fields = (
            'person_id',
            'first_name',
            'middle_name',
            'last_name',
            'generation_code',
            'prefix',
            'birth_date',
            'ref_gender',
            'organization',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

    def is_read_only(self, obj):
        """
        Determines whether the given user has read or write access to the record.
        """
        request = self.context.get('request', None)

        if request is not None:

            if obj.organization.filter(
                            organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                    ).count() == 0:
                return True

            return False

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def create(self, validated_data):

        request = self.context.get('request', None)
        if request:
            organization_data = validated_data.pop('organizationpersonrole_set')

            # There must be at least one organization supplied:
            if len(organization_data) == 0:
                error_msg = "At least one organization must be specified."
                raise ValidationError(detail=error_msg)

            # We need to validate the organization before creating the person:
            # - Does the user have write access to the supplied organizations?
            for org in organization_data:
                if org.get('organization') not in Organization.objects.get_readwrite_orgs(request.user):
                    error_msg = "Write permissions are required for: " + str(org.get('organization'))
                    raise PermissionDenied(detail=error_msg)
                # - Does the user have read access to the supplied ref_role?
                role = org.get('ref_role')

                if not role.universal:
                    if role not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected role."
                        raise PermissionDenied(detail=error_msg)

            validated_data['created_by'] = request.user
            person = Person.objects.create(**validated_data)
            for org in organization_data:
                OrganizationPersonRole.objects.create(person=person, **org)
            return person
        else:
            raise ValidationError(detail="No request context provided.")

    def update(self, instance, validated_data):
        """

        """
        raise ValidationError(detail="PersonListSerializer does not support create operations.")


class PersonDetailSerializer(serializers.ModelSerializer):
    """
    Describes a client or staff person.
    """

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = Person
        fields = (
            'person_id',
            'first_name',
            'middle_name',
            'last_name',
            'generation_code',
            'prefix',
            'birth_date',
            'ref_gender',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

    def is_read_only(self, obj):
        """
        Determines whether the given user has read or write access to the record.
        """
        request = self.context.get('request', None)

        if request is not None:

            if obj.organization.filter(
                            organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                    ).count() == 0:
                return True

            return False

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def create(self, validated_data):
        """
        We need to prevent attempts to create Person records via this serializer, since it
        omits OrganizationPersonRole links, which are required for auth purposes.

        :param validated_data:
        :return:
        """
        raise ValidationError(detail="PersonDetailSerializer does not support create operations.")

    def update(self, instance, validated_data):

        request = self.context.get('request', None)
        if request:
            # The update view for a Person record does not include its OrganizationPersonRole records.
            # That said, read/write access entirely based on that set of records.

            # Does the user have write access to at least one of the Person's organizations?

            if instance.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this person record."
                raise PermissionDenied(detail=error_msg)
            else:

                # Does the user have read access to ref_gender?
                gender = validated_data.get('ref_gender')
        
                if gender != None and not gender.universal:
                    if gender.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected gender."
                        raise PermissionDenied(detail=error_msg)

                instance.first_name = validated_data.get('first_name', instance.first_name)
                instance.middle_name = validated_data.get('middle_name', instance.middle_name)
                instance.last_name = validated_data.get('last_name', instance.last_name)
                instance.generation_code = validated_data.get('generation_code', instance.generation_code)
                instance.prefix = validated_data.get('prefix', instance.prefix)
                instance.birth_date = validated_data.get('birth_date', instance.birth_date)
                instance.ref_gender = validated_data.get('ref_gender', instance.ref_gender)

                instance.modified_by = request.user
                instance.save()
                return instance

        else:
            raise ValidationError(detail="No request context provided.")


class PersonCreateSerializer(serializers.ModelSerializer):

    organization_id = serializers.IntegerField(write_only=True)

    ref_role_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Person

        fields = (
            'person_id',
            'first_name',
            'middle_name',
            'last_name',
            'generation_code',
            'prefix',
            'birth_date',
            'ref_gender',
            'organization_id',
            'ref_role_id'
        )

    def validate_organization_id(self, value):
        try:
            o = Organization.objects.get(organization_id=value)
        except Organization.DoesNotExist:
            raise ValidationError(detail="Organization does not exist.")
        return value

    def validate_ref_role_id(self, value):
        try:
            r = RefRole.objects.get(ref_role_id=value)
        except RefRole.DoesNotExist:
            raise ValidationError(detail="Role does not exist")
        return value

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to the supplied organization?
            try:
                org = Organization.objects.get(organization_id=validated_data.get('organization_id', None))
            except Organization.DoesNotExist:
                raise ValidationError(detail="Organization does not exist.")

            if org not in Organization.objects.get_readwrite_orgs(request.user):
                raise PermissionDenied(detail='Write access to the supplied organization is required.')

            # Does the user have read access to the supplied role?
            role = RefRole.objects.get(pk=validated_data.get('ref_role_id'))
            if not role.universal:
                if role.organization not in Organization.objects.get_read_orgs(request.user):
                    raise PermissionDenied(detail='Read access to the supplied role is required.')

            person = Person.objects.create(
                first_name=validated_data.get('first_name', None),
                middle_name=validated_data.get('middle_name', None),
                last_name=validated_data.get('last_name', None),
                generation_code=validated_data.get('generation_code', None),
                prefix=validated_data.get('prefix', None),
                birth_date=validated_data.get('birth_date', None),
                ref_gender=validated_data.get('ref_gender', None),
                created_by=request.user
            )

            OrganizationPersonRole.objects.create(
                person=person,
                organization=org,
                ref_role=role,
                created_by=request.user
            )

            return person
        else:
            raise ValidationError(detail="No request context provided.")


class AdultSerializer(serializers.ModelSerializer):
    """
    A simple serializer for the Adult model. Because the model has only a single field and
    that field is a relationship, the serializer supports only create and delete operations.
    """
    class Meta:
        model = Adult
        fields = (
            'person',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by'
        )

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request:
            person_id = validated_data.get('person', None)
            try:
                person = Person.objects.get(person_id=person_id)
            except Person.DoesNotExist:
                raise ValidationError("Person record does not exist.")

            if person:
                # Does the user have write rights to the supplied person record?
                if person.organization.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
                ).count() > 0:
                    validated_data["person"] = person
                    validated_data["created_by"] = request.user
                    return super(AdultSerializer, self).create(validated_data)
            else:
                raise ValidationError("No person was supplied.")

        else:
            raise ValidationError(detail="No request context provided")


class ChildSerializer(serializers.ModelSerializer):
    """
    A simple serializer for the Child model. Because the model has only a single field and
    that field is a relationship, the serializer supports only create and delete operations.
    """
    class Meta:
        model = Child
        fields = (
            'person',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by'
        )

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request:
            person_id = validated_data.get('person', None)
            try:
                person = Person.objects.get(person_id=person_id)
            except Person.DoesNotExist:
                raise ValidationError("Person record does not exist.")

            if person:
                # Does the user have write rights to the supplied person record?
                if person.organization.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
                ).count() > 0:
                    validated_data["person"] = person
                    validated_data["created_by"] = request.user
                    return super(ChildSerializer, self).create(validated_data)
            else:
                raise ValidationError("No person was supplied.")

        else:
            raise ValidationError(detail="No request context provided")