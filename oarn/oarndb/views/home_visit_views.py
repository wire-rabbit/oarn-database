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

from oarndb.models import HomeVisit, Organization, ContactLog
from oarndb.serializers import HomeVisitSerializer, ContactLogSerializer


class HomeVisitList(generics.ListCreateAPIView):
    """
    Each home visit record represents a single home visit for a family. Read/Write access is determined by the
    user's access to the linked family.
    """
    serializer_class = HomeVisitSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return HomeVisit.objects.filter(
                family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('family', '-visit_date')
        else:
            family_id_filter = self.request.query_params.get('family_id', None)
            if family_id_filter:
                return HomeVisit.objects.filter(family__family_id=family_id_filter).filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('family', '-visit_date')
            else:
                # We need to return the default so that pagination doesn't break
                return HomeVisit.objects.filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('family', '-visit_date')


class HomeVisitDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Each home visit record represents a single home visit for a family. Read/Write access is determined by the
    user's access to the linked family.
    """
    serializer_class = HomeVisitSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        return HomeVisit.objects.filter(
                family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('famiy', '-visit_date')

    def delete(self, request, *args, **kwargs):
        try:
            obj = HomeVisit.objects.get(pk=kwargs.get('pk', None))
        except HomeVisit.DoesNotExist:
            raise Http404

        if obj.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(self.request.user)
        ).count() == 0:
            error_msg = "Write permissions for this family are required to delete this home visit record."
            raise PermissionDenied(detail=error_msg)

        return super(HomeVisitDetail, self).delete(self, request, *args, **kwargs)


class ContactLogList(generics.ListCreateAPIView):
    """
    The contact log describes an in-person or telephone contact between an employee and a client, other
    than a home visit. Read access is based on the user's read access to the family, write access requires
    write access to the family, read access to the employee, and that the family_member be linked to the
    family either as a child or an adult. Read access to the contact type is also required for create/update
    operations. DELETE requests require write access to the family. If a query parameter of ?family_id=123 is
    passed to a GET request, only those contacts related to family 123 are returned.
    """

    serializer_class = ContactLogSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return ContactLog.objects.filter(
                family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('family', '-contact_date')
        else:
            family_id_filter = self.request.query_params.get('family_id', None)
            if family_id_filter:
                return ContactLog.objects.filter(family__family_id=family_id_filter).filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('family', '-contact_date')
            else:
                # We need to return the default so that pagination doesn't break
                return ContactLog.objects.filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('family', '-contact_date')


class ContactLogDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    The contact log describes an in-person or telephone contact between an employee and a client, other
    than a home visit. Read access is based on the user's read access to the family, write access requires
    write access to the family, read access to the employee, and that the family_member be linked to the
    family either as a child or an adult. Read access to the contact type is also required for create/update
    operations. DELETE requests require write access to the family. If a query parameter of ?family_id=123 is
    passed to a GET request, only those contacts related to family 123 are returned.
    """
    serializer_class = ContactLogSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        return ContactLog.objects.filter(
            family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
        ).order_by('famiy', '-contact_date')

    def delete(self, request, *args, **kwargs):
        try:
            obj = ContactLog.objects.get(pk=kwargs.get('pk', None))
        except ContactLog.DoesNotExist:
            raise Http404

        if obj.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(self.request.user)
        ).count() == 0:
            error_msg = "Write permissions for this family are required to delete this contact log record."
            raise PermissionDenied(detail=error_msg)

        return super(ContactLogDetail, self).delete(self, request, *args, **kwargs)

