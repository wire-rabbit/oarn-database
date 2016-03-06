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

from oarndb.models import CaseManager, Person, Organization, Family, RefRole, OrganizationPersonRole
from oarndb.models import FamilyEnrollment, PersonEnrollment, ServiceLevelEnrollment

from oarndb.serializers import NestedPersonSerializer, NestedRefProgramSerializer, NestedRefServiceLevelSerializer
from oarndb.serializers import NestedServiceLevelEnrollmentSerializer, NestedPersonEnrollmentSerializer


class FamilyEnrollmentReadOnlySerializer(serializers.ModelSerializer):
    """
    Provides a read-only, but complete view into a given family's enrollment situation. The main
    purpose is to allow front-ends to interact with relationships between the different levels
    (e.g., if the program changes it impacts service levels and may justify a warning). The read_only
    field indicates whether at the manipulable end-points the user will have write access (again, mainly
    for front-end use).
    """

    servicelevelenrollment_set = NestedServiceLevelEnrollmentSerializer(many=True, partial=True)

    personenrollment_set = NestedPersonEnrollmentSerializer(many=True, partial=True)

    ref_program = NestedRefProgramSerializer()

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = FamilyEnrollment

        fields = (
            'family_enrollment_id',
            'family',
            'ref_program',
            'location',
            'open_date',
            'close_date',
            'personenrollment_set',
            'servicelevelenrollment_set',
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
            if obj.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                return True
            else:
                return False
        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")


class FamilyEnrollmentSerializer(serializers.ModelSerializer):
    """
    Links a family to a given program at a given time.
    """
    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = FamilyEnrollment

        read_only = serializers.SerializerMethodField('is_read_only')

        fields = (
            'family_enrollment_id',
            'family',
            'ref_program',
            'location',
            'open_date',
            'close_date',
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
            if obj.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                return True
            else:
                return False
        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to this family?
            family = validated_data.get('family', None)
            if family:
                if family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for this family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family was supplied.")

            # Does the user have read access to the supplied program?
            ref_program = validated_data.get('ref_program', None)
            if ref_program:
                if not ref_program.universal:
                    if ref_program.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected program."
                        raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No program was supplied.")

            # If we've made it here, we can create the record:
            validated_data['created_by'] = request.user
            return super(FamilyEnrollmentSerializer, self).create(validated_data)

        else:
            raise ValidationError(detail="No request context provided")

    def update(self, instance, validated_data):
        """
        Updates a given FamilyEnrollment instance. A side-effect of changing the program is that
        related service level records are destroyed (this is to prevent impossible service level
        values).
        """
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to the family referenced in the given instance?
            if instance.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                    error_msg = "Write permissions are required for the family record " \
                                "referenced by the existing instance."
                    raise PermissionDenied(detail=error_msg)

            # Does the user have write access to the supplied family?
            family = validated_data.get('family', None)
            if family:
                if family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for this family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family was supplied.")

            # Does the user have read access to the supplied program?
            ref_program = validated_data.get('ref_program', None)
            if ref_program:
                if not ref_program.universal:
                    if ref_program.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected program."
                        raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No program was supplied.")

            # Does the new program record differ from the old program record?
            # If so, we need to delete associated service level records to make sure we don't
            # end up with impossible values there.
            if instance.ref_program != ref_program:
                instance.servicelevelenrollment_set.all().delete()
            # If we've made it here, we can update the record:
            validated_data['modified_by'] = request.user
            return super(FamilyEnrollmentSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")


class CaseManagerSerializer(serializers.ModelSerializer):
    """
    Identifies an employee as being responsible for services to a given person.
    This serializer is read-only.
    """

    read_only = serializers.SerializerMethodField('is_read_only')

    person = NestedPersonSerializer()

    class Meta:
        model = CaseManager

        fields = (
            'case_manager_id',
            'person',
            'family',
            'begin_date',
            'end_date',
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

            if obj.person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                return True

            # Does the user have write permissions for this family?
            if obj.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                return True

            return False

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")


class CaseManagerCreateSerializer(serializers.Serializer):

    case_manager_id = serializers.IntegerField(read_only=True)

    person_id = serializers.IntegerField()

    family_id = serializers.IntegerField()

    begin_date = serializers.DateField(required=True)

    end_date = serializers.DateField(required=False, allow_null=True)

    def validate_person_id(self, value):
        try:
            p = Person.objects.get(pk=value)
        except Person.DoesNotExist:
            raise ValidationError(detail="Person does not exist")

        # The person must also have a role other than client:
        client_role = RefRole.objects.get(description='Client')

        if p.organizationpersonrole_set.exclude(ref_role=client_role).count() == 0:
            raise ValidationError(detail="Person must have a role other than 'Client'")

        return value

    def validate_family_id(self, value):
        try:
            f = Family.objects.get(pk=value)
        except Family.DoesNotExist:
            raise ValidationError(detail="Family does not exist")
        return value

    def create(self, validated_data):
        """
        Creates a new case manager record.

        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        if request:
            # Does the user have write permissions for this person?
            person = Person.objects.get(pk=validated_data.get('person_id'))
            if person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this person record."
                raise PermissionDenied(detail=error_msg)

            # Does the user have write permissions for this family?

            family = Family.objects.get(pk=validated_data.get('family_id'))
            if family.organizations.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this family record."
                raise PermissionDenied(detail=error_msg)

            # Now we can create the case manager record:
            cm = CaseManager.objects.create(
                person=person,
                family=family,
                begin_date=validated_data.get('begin_date'),
                end_date=validated_data.get('end_date'),
                created_by=request.user
            )

            return validated_data

        else:
            raise ValidationError(detail="No request context provided")


class CaseManagerModelSerializer(serializers.ModelSerializer):

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = CaseManager

        fields = (
            'case_manager_id',
            'person',
            'family',
            'begin_date',
            'end_date',
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

            if obj.person.organization.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                    ).count() == 0:
                return True

            # Does the user have write permissions for this family?
            if obj.family.organizations.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                return True

            return False

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def update(self, instance, validated_data):
        """
        Update an existing case manager instance.

        :param instance:
        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        if request:
            # Does the user have write permissions for this potentially new person?

            person = validated_data.get('person', None)
            if not person:
                raise ValidationError(detail="Person does not exist")

            if person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this person record."
                raise PermissionDenied(detail=error_msg)

            # Does the user have write permissions for this potentially new family?
            family = validated_data.get('family', None)
            if not family:
                raise ValidationError(detail="Family does not exist")

            if family.organizations.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this family record."
                raise PermissionDenied(detail=error_msg)

            # Does the user have write permissions for this instance?
            if instance.person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this person record."
                raise PermissionDenied(detail=error_msg)

            if instance.family.organizations.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this family record."
                raise PermissionDenied(detail=error_msg)

            # Now we can udpate the case manager record:
            instance.person = person
            instance.family = family
            instance.begin_date = validated_data.get('begin_date')
            instance.end_date = validated_data.get('end_date', None)
            instance.modified_by = request.user
            instance.save()

            return instance

        else:
            raise ValidationError(detail="No request context provided")


class PersonEnrollmentSerializer(serializers.ModelSerializer):
    """
    Defines individual participation for a family receiving services. If a family is enrolled in Outreach,
    for example (defined in FamilyEnrollment), PersonEnrollment would tell us which adults and children
    are receiving those services.
    """

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = PersonEnrollment

        fields = (
            'person_enrollment_id',
            'person',
            'family_enrollment',
            'open_date',
            'close_date',
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
            # Does the user have write access to the person?
            if obj.person.organization.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                    ).count() == 0:
                return True

            # Does the user have write access to the family?
            if obj.family_enrollment.family.organizations.filter(
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
            # Does the user have write access to this family?
            family_enrollment = validated_data.get('family_enrollment', None)
            if family_enrollment:
               if family_enrollment.family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for this family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family enrollment record was supplied.")

            person = validated_data.get('person', None)
            if person:
                if person.organization.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                        ).count() == 0:
                    error_msg = "Write permissions are required for this person record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No person was supplied.")

            # If we've made it here, we can create the record:
            validated_data['created_by'] = request.user
            return super(PersonEnrollmentSerializer, self).create(validated_data)

        else:
            raise ValidationError(detail="No request context provided")

    def update(self, instance, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to the family referenced in the given instance?
            if instance.family_enrollment.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                    error_msg = "Write permissions are required for the family record " \
                                "referenced by the existing instance."
                    raise PermissionDenied(detail=error_msg)

            # Does the user have write access to the person referenced in the given instance?
            if instance.person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                    ).count() == 0:
                error_msg = "Write permissions are required for the person record " \
                            "referenced by the existing instance."
                raise PermissionDenied(detail=error_msg)

            # Does the user have write access to this family?
            family_enrollment = validated_data.get('family_enrollment', None)
            if family_enrollment:
                if family_enrollment.family.organizations.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for this family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family enrollment record was supplied.")

            person = validated_data.get('person', None)
            if person:
                if person.organization.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                        ).count() == 0:
                    error_msg = "Write permissions are required for this person record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No person was supplied.")

            # If we've made it here, we can update the record:
            validated_data['modified_by'] = request.user
            return super(PersonEnrollmentSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")


class ServiceLevelEnrollmentSerializer(serializers.ModelSerializer):
    """
    Some programs have different levels of service. Outreach, for example, may be basic or intensive at
    some agencies.
    """

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = ServiceLevelEnrollment

        fields = (
            'service_level_enrollment_id',
            'family_enrollment',
            'ref_service_level',
            'open_date',
            'close_date',
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
            # Does the user have write access to the family?
            if obj.family_enrollment.family.organizations.filter(
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
            # Does the user have write access to this family?
            family_enrollment = validated_data.get('family_enrollment', None)
            if family_enrollment:
               if family_enrollment.family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for this family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family enrollment record was supplied.")

            # If we've made it here, we can create the record:
            validated_data['created_by'] = request.user
            return super(ServiceLevelEnrollmentSerializer, self).create(validated_data)

        else:
            raise ValidationError(detail="No request context provided")

    def update(self, instance, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to the family referenced in the given instance?
            if instance.family_enrollment.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                    error_msg = "Write permissions are required for the family record " \
                                "referenced by the existing instance."
                    raise PermissionDenied(detail=error_msg)

            # Does the user have write access to this family?
            family_enrollment = validated_data.get('family_enrollment', None)
            if family_enrollment:
                if family_enrollment.family.organizations.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for this family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family enrollment record was supplied.")

            # If we've made it here, we can update the record:
            validated_data['modified_by'] = request.user
            return super(ServiceLevelEnrollmentSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")