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

from django.http import Http404
from rest_framework import permissions, generics
from rest_framework.exceptions import PermissionDenied

from oarndb.models import Person, Organization, OrganizationPersonRole, RefRole
from oarndb.models import OrganizationLocation

from oarndb.serializers import StaffListSerializer
from oarndb.serializers import OrganizationAccessSerializer, OrganizationLocationSerializer

class StaffListView(generics.ListAPIView):

    serializer_class = StaffListSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # by default, return every non-client person the user has access to:

        client_role = RefRole.objects.get(description='Client')

        return Person.objects.filter(
            organization__in=Organization.objects.get_read_orgs(self.request.user)
        ).exclude(
            organizationpersonrole__ref_role=client_role
        ).distinct().order_by('last_name', 'first_name')


class OrganizationAccessView(generics.ListAPIView):
    """
    Defines the access rights the current user has to each organization.
    Available rights are: ['read', 'write', 'admin']
    """

    serializer_class = OrganizationAccessSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):

        org_set = set()
        results_list = []
        for org in Organization.objects.get_admin_orgs(self.request.user).order_by('name'):
            results_list.append({
                'organization_id': org.organization_id,
                'name': org.name,
                'short_name': org.short_name,
                'access_type': 'admin'
            })
            org_set.add(org.organization_id)

        for org in Organization.objects.get_readwrite_orgs(self.request.user).order_by('name'):
            if org.organization_id not in org_set:
                results_list.append({
                    'organization_id': org.organization_id,
                    'name': org.name,
                    'short_name': org.short_name,
                    'access_type': 'write'
                })
                org_set.add(org.organization_id)

        for org in Organization.objects.get_read_orgs(self.request.user).order_by('name'):
            if org.organization_id not in org_set:
                results_list.append({
                    'organization_id': org.organization_id,
                    'name': org.name,
                    'short_name': org.short_name,
                    'access_type': 'read'
                })
                org_set.add(org.organization_id)

        return results_list


class OrganizationLocationList(generics.ListCreateAPIView):

    serializer_class = OrganizationLocationSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        return OrganizationLocation.objects.filter(
            organization__in=Organization.objects.get_read_orgs(self.request.user)
        )


class OrganizationLocationDetail(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = OrganizationLocationSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        return OrganizationLocation.objects.filter(
            organization__in=Organization.objects.get_read_orgs(self.request.user)
        )

    def delete(self, request, *args, **kwargs):
        try:
            obj = OrganizationLocation.objects.get(pk=kwargs.get('pk', None))
        except OrganizationLocation.DoesNotExist:
            raise Http404

        if Organization.objects.get_admin_orgs(request.user).filter(
                organization_id=obj.organization.organization_id).count() == 0:
            raise PermissionDenied(detail="Admin rights for this organization are required to delete "
                                          "this location record")

        return super(OrganizationLocationDetail, self).delete(self, request, *args, **kwargs)