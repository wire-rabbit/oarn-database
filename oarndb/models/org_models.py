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
from django.contrib.auth.models import User, Group

from django.db.models import Q


from oarndb.models.base_model import BaseModel


class SecureManager(models.Manager):
    """
    Provides a mechanism for returning results that only a specified
    user should have access to, or updating records in a way that 
    is limited to the rights of a specified user.
    """

    def get_read_orgs(self, user):
        """
        Returns a QuerySet of Organization records that the supplied user
        has read access to.
        """

        if user is not None:
            # is the user in 'global_readonly' or 'global_admin'?
            if user.groups.filter(
                Q(name='global_readonly')|Q(name='global_admin')
            ).count() > 0:
                # Yes, so return all Organization objects
                return Organization.objects.all()

            # the user isn't a global member, so return only those 
            # Organization objects s/he has '_readonly', '_readwrite',
            # or '_admin' rights to:
            return Organization.objects.filter(
                Q(read_only_group__in=user.groups.all())|
                Q(read_write_group__in=user.groups.all())|
                Q(admin_group__in=user.groups.all())
            )       
        else:
            return Organization.objects.none()

    def get_readwrite_orgs(self, user):
        """
        Returns a QuerySet of Organization records that the supplied user
        has read/write access to.
        """

        if user is not None:
            # is the user in 'global_admin'?
            if user.groups.filter(name='global_admin').count() > 0:
                # Yes, so return all Organization objects
                return Organization.objects.all()

            # the user isn't a global member, so return only those 
            # Organization objects s/he has '_readwrite', or '_admin' 
            # rights to:
            return Organization.objects.filter(
                Q(read_write_group__in=user.groups.all())|
                Q(admin_group__in=user.groups.all())
            )
        else:
            return Organization.objects.none()

    def get_admin_orgs(self, user):
        """
        Returns a QuerySet of Organization records that the supplied user 
        has admin access to.
        """

        if user is not None:
            # is the user in 'global_admin'?
            if user.groups.filter(name='global_admin').count() > 0:
                # Yes, so return all Organization objects
                return Organization.objects.all()

            # the user isn't a global member, so return only those 
            # Organization objects s/he has '_readwrite', or '_admin' 
            # rights to:
            return Organization.objects.filter(
                Q(admin_group__in=user.groups.all())
            )
        else:
            return Organization.objects.none()

    def can_read_person(self, user, person):
        """
        Returns True if the supplied user has read rights to at least one
        organization the person is associated with, False otherwise. We don't
        require read membership for *every* organization connected to the
        person - if we did, we'd have to grant, e.g., organization-wide 
        read-access at MTN to data entry staff at FBB if a single client were
        enrolled at both agencies.        
        """
        if user is not None:
            # is the user in 'global_admin' or 'global_readonly'?
            if user.groups.filter(
                Q(name='global_admin') | 
                Q(name='global_readonly')
            ).count() > 0:
                return True

            # is the user in any of the read or admin groups of the person?
            if OrganizationPersonRole.objects.filter(person=person).filter(
                organization__in=Organization.objects.get_read_orgs(
                user)).count() > 0:
                return True

        # If we reach this point, no read access is present:
        return False

    def get_permissions(self, user, instance):
        """
        Returns a dictionary: {'read':Boolean, 'write': Boolean}
        The instance is used only with a few models in this project.
        """
        # The default:
        result = {'read': False, 'write': False}      

        if user is not None and instance is not None:
            global_readonly = False

            # is the user in 'global_admin'?
            if user.groups.filter(Q(name='global_admin')).count() > 0:
                return {'read': True, 'write': True}
        
            # is the user in 'global_readonly'?
            if user.groups.filter(Q(name='global_readonly')).count() > 0:
                global_readonly = True 

            # Person
            if instance.__class__.__name__ == 'Person':
                # Read requires read membership in at least one org the person is linked with:
                if global_readonly or OrganizationPersonRole.objects.filter(person=instance).filter(
                    organization__in=Organization.objects.get_read_orgs(user)).count() > 0:
                    result['read'] = True

                # Write requires write membership in at least one org the person is linked with:
                if OrganizationPersonRole.objects.filter(person=instance).filter(
                    organization__in=Organization.objects.get_readwrite_orgs(user)).count() > 0:
                    result['write'] = True

            # Child/Adult
            if instance.__class__.__name__ == 'Child' or instance.__class__.__name__ == 'Adult':
                # This is essentially the same test for person, but we need to grab the
                # Person from Child or Adult first.
                # Read requires read membership in at least one org the person is linked with:
                if global_readonly or OrganizationPersonRole.objects.filter(person=instance.person).filter(
                    organization__in=Organization.objects.get_read_orgs(user)).count() > 0:
                    result['read'] = True

                # Write requires write membership in at least one org the person is linked with:
                if OrganizationPersonRole.objects.filter(person=instance.person).filter(
                    organization__in=Organization.objects.get_readwrite_orgs(user)).count() > 0:
                    result['write'] = True

            # Family
            if instance.__class__.__name__ == 'Family':
                # Read requires read membership in at least one org the family is linked with:
                if global_readonly or OrganizationFamilyLink.objects.filter(family=instance).filter(
                        organization__in=Organization.objects.get_read_orgs(user)).count() > 0:
                    result['read'] = True

                # Write requires write membership in at least one org the family is linked with:
                if  OrganizationFamilyLink.objects.filter(family=instance).filter(
                        organization__in=Organization.objects.get_readwrite_orgs(user)).count() > 0:
                    result['write'] = True

            # Reference Table (starts with 'Ref')
            if instance.__class__.__name__.startswith('Ref'):
                if instance.universal:
                    pass

        # return what we have:
        return result


class Organization(BaseModel):
    """
    Each Relief Nursery will have an organization record.
    """

    objects = SecureManager()

    organization_id = models.AutoField(
        'organization_id',
        primary_key=True
    )

    name = models.CharField('name', max_length=60, null=False, unique=True)

    short_name = models.CharField('short_name', max_length=30, null=False, unique=True)

    abbreviation = models.CharField('abbreviation', max_length=5, null=True)

    read_only_group = models.ForeignKey(
        'auth.Group', 
        verbose_name='read_only_group',
        related_name='read_only_org',
        null=True,
    )
  
    read_write_group = models.ForeignKey(
        'auth.Group',
        verbose_name='read_write_group',
        related_name='read_write_org',
        null=True
    )

    admin_group = models.ForeignKey(
        'auth.Group',
        verbose_name='admin_group',
        related_name='admin_org',
        null=True
    )

    def __str__(self):
        return self.short_name

    def get_type(self):
        return self.__class__.__name__

    class Meta:
        db_table = "organization"
        ordering = ["name"]


class OrganizationLocation(BaseModel):
    """
    Heavily modified from CEDS, defining an address for an organizational site.
    """
    
    organization_location_id = models.AutoField(
        'organization_location_id',
        primary_key=True
    )

    organization = models.ForeignKey("Organization", verbose_name='organization')

    name = models.CharField('name', max_length=60, null=False)

    short_name = models.CharField('short_name', max_length=30, null=False)

    street_number_and_name = models.CharField('street_number_and_name', max_length=40, null=False)

    apartment_room_or_suite_number = models.CharField(
        'apartment_room_or_suite_number',
        max_length=30,
        null=True,
        blank=True
    )

    city = models.CharField('city', max_length=30, null=False)

    ref_state = models.ForeignKey("RefState", verbose_name='ref_state')

    postal_code = models.CharField('postal_code', max_length=17, null=False)

    # Dropped from the SQL 'address_county_name' - this should be solely by reference table lookup.
    ref_county = models.ForeignKey("RefCounty", verbose_name='ref_county')

    def __str__(self):
        return self.short_name

    class Meta:
        db_table = "organization_location"
        ordering = ["name"]


class OrganizationFamilyLink(BaseModel):
    """
    Links a family record to an organization.
    """

    family = models.ForeignKey("Family")

    organization = models.ForeignKey("Organization")

    class Meta:
        db_table = 'organization_family_link'

        def __str__(self):
            return self.family.__str__() + ': ' +\
                self.organization.__str__() + ': '


class OrganizationPersonRole(BaseModel):
    """
    Links a person (client, employee, etc.) to an organization, and 
    in the case of employees, describes a job role over time (e.g., 
    "Classroom Teacher", "Interventionist")
    """
    
    organization_person_role_id = models.AutoField(
        'organization_person_role_id',
        primary_key=True
    )

    organization = models.ForeignKey(
        "Organization",
        verbose_name='organization'
    )

    person = models.ForeignKey("Person", verbose_name='person')

    ref_role = models.ForeignKey("RefRole", verbose_name='ref_role')

    entry_date = models.DateField(
        'entry_date',
        auto_now=False,   
        auto_now_add=True,
    )

    exit_date = models.DateField(
        'exit_date',
        auto_now=False,
        auto_now_add=False,
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'organization_person_role'

    def __str__(self):
        return self.person.__str__() + ': ' +\
            self.organization.__str__() + ': ' +\
            self.ref_role.__str__()
