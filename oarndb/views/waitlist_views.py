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

from oarndb.serializers import WaitlistSerializer
from oarndb.models import Waitlist, Organization


class WaitlistList(generics.ListCreateAPIView):
    """
    Defines the history and status of a family on the waitlist for services. Write access to the family and
    read access to the assigned employee, referral source, and status is required for creation and updates.
    Deletion requires write access to the family.
    """

    serializer_class = WaitlistSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return Waitlist.objects.filter(
                family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('-open_date')
        else:
            family_id_filter = self.request.query_params.get('family_id', None)
            if family_id_filter:
                return Waitlist.objects.filter(family__family_id=family_id_filter).filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('-open_date')
            else:
                # We need to return the default so that pagination doesn't break
                return Waitlist.objects.filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('-open_date')


class WaitlistDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Defines the history and status of a family on the waitlist for services. Write access to the family and
    read access to the assigned employee, referral source, and status is required for creation and updates.
    Deletion requires write access to the family.
    """

    serializer_class = WaitlistSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Waitlist.objects.filter(
                family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('-open_date')

    def delete(self, request, *args, **kwargs):
        try:
            obj = Waitlist.objects.get(pk=kwargs.get('pk', None))
        except Waitlist.DoesNotExist:
            raise Http404

        if obj.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(self.request.user)
        ).count() == 0:
            error_msg = "Write permissions for this family are required to delete this waitlist record."
            raise PermissionDenied(detail=error_msg)

        return super(WaitlistDetail, self).delete(self, request, *args, **kwargs)