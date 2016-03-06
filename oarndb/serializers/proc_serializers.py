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


"""
These serializers are not directly backed by a model and are read only.
"""

from django.contrib.auth.models import User, Group

from oarndb.models import Organization

from rest_framework import serializers
from rest_framework.exceptions import NotAuthenticated, ValidationError

class AdultSearchSerializer(serializers.Serializer):
    """
    Search result details for the main UI.
    """
    person_id = serializers.IntegerField(min_value=1)

    first_name = serializers.CharField(max_length=35)

    last_name = serializers.CharField(max_length=35)

    gender = serializers.CharField(max_length=50, allow_null=True)

    birth_date = serializers.DateField(allow_null=True)

    primary_adult = serializers.BooleanField()

    is_child = serializers.BooleanField()


class ChildSearchSerializer(serializers.Serializer):
    """
    Search result details for the main UI.
    """
    person_id = serializers.IntegerField(min_value=1)

    first_name = serializers.CharField(max_length=35)

    last_name = serializers.CharField(max_length=35)

    gender = serializers.CharField(max_length=50, allow_null=True)

    birth_date = serializers.DateField(allow_null=True)

    is_child = serializers.BooleanField()


class OrganizationAccessSerializer(serializers.Serializer):
    """
    A list of organizations, their IDs, and access rights for a given user.
    """
    organization_id = serializers.IntegerField()

    name = serializers.CharField(max_length=60)

    short_name = serializers.CharField(max_length=30)

    access_type = serializers.CharField(max_length=30)