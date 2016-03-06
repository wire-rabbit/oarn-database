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
from django.contrib.auth.models import User, Group

from oarndb.models import Organization

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
