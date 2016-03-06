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

from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError

from django.http import Http404


class ListCreateAPIView(generics.ListCreateAPIView):

    def get_queryset(self):
        """
        Return a list of all RefAdultChildRelationshipType records that the
        currently authenticated user has access to.
        """
        return self.serializer_class.Meta.model.objects.get_visible(self.request.user)


class RetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):

    def get_queryset(self):
        """
        Return a list of all RefAdultChildRelationshipType records that the
        currently authenticated user has access to.
        """
        return self.serializer_class.Meta.model.objects.get_visible(self.request.user)

    def delete(self, request, *args, **kwargs):
        try:
            obj = self.serializer_class.Meta.model.objects.get(pk=kwargs.get('pk', None))
        except self.serializer_class.Meta.model.DoesNotExist:
            raise Http404

        instance_access = obj.get_instance_access(self.request.user)
        if instance_access['write']:
            return super(RetrieveUpdateDestroyAPIView, self).delete(self, request, *args, **kwargs)
        else:
            raise PermissionDenied(detail='User lacks delete permissions on this object.')