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
from rest_framework.views import APIView
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError

from rest_framework.filters import SearchFilter

from fuzzywuzzy import fuzz

from oarndb.models import Person, Adult, AdultFamilyRelationship, RefGender, Organization
from oarndb.models import ChildFamilyRelationship
from oarndb.serializers import AdultSearchSerializer, ChildSearchSerializer


class AdultSearchList(generics.ListAPIView):
    """
    A read-only list of adult records (with a partial subset of fields) viewable by the current user.
    Query parameters:
    Beyond the usual pagination parameters of limit and offset, these options are available:
    - ?first_name=jo - returns adults with first names beginning with jo (case insensitive)
    - ?last_name=ba - returns adults with last names beginning with ba (case insensitive)
    - ?person_id=123 - returns records with a person ID of exactly 123 (first_name and last_name
    parameters are ignored in this case. It is possible that more than one adult record
    might be returned in this case, if they are the primary caregiver in one family and also linked
    to another family where they are not.)
    - ?family_id=123 - this actually returns all members of the family related to this (both adults
    and children) and is identical to the same parameter passed to child-search.
    - ?family_id_strict=123 - this returns only the adults related to this family
    - ?first_name=jo&last_name=ba - it is possible to filter by both first and last names
    - ?fuzzy_match=Joe Smith - Uses the FuzzyWuzzy library to check first + last name combinations
    against the raw results, returning those with a partial ratio above 75
    - ?dupes_check=Joe Smith - Uses the FuzzyWuzzy library to check first + last name combinations
    against the raw results, returning those wiht a partial ratio above 85
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AdultSearchSerializer

    def get_queryset(self):

        result_list = []

        if len(self.request.query_params) == 0:
            query = AdultFamilyRelationship.objects.select_related(
                'adult__person__ref_gender'
            ).filter(
                adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('adult__person__last_name', 'adult__person__first_name')

        else:
            person_id_filter = self.request.query_params.get('person_id', None)
            family_id_filter = self.request.query_params.get('family_id', None)
            first_name_filter = self.request.query_params.get('first_name', None)
            last_name_filter = self.request.query_params.get('last_name', None)
            fuzzy_match_filter = self.request.query_params.get('fuzzy_match', None)
            dupes_check_filter = self.request.query_params.get('dupes_check', None)
            family_id_strict_filter = self.request.query_params.get('family_id_strict', None)

            if person_id_filter:
                try:
                    int(person_id_filter)
                except ValueError:
                    return result_list

                query = AdultFamilyRelationship.objects.select_related(
                    'adult__person__ref_gender'
                ).filter(
                    adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(adult__person__person_id=person_id_filter).order_by(
                    'adult__person__last_name', 'adult__person__first_name'
                )
            elif family_id_filter:
                try:
                    int(family_id_filter)
                except ValueError:
                    return result_list

                child_query = ChildFamilyRelationship.objects.select_related(
                    'child__person__ref_gender'
                ).filter(
                    child__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(family_id=family_id_filter).order_by(
                    'child__person__last_name', 'child__person__first_name'
                )

                adult_query = AdultFamilyRelationship.objects.select_related(
                    'adult__person__ref_gender'
                ).filter(
                    adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(family_id=family_id_filter).order_by(
                    'adult__person__last_name', 'adult__person__first_name'
                )

                id_set = set()
                for item in child_query:
                    if item.child.person.person_id not in id_set:
                        result_list.append(
                            {
                                'person_id': item.child.person.person_id,
                                'first_name': item.child.person.first_name,
                                'last_name': item.child.person.last_name,
                                'birth_date': item.child.person.birth_date,
                                'gender': item.child.person.ref_gender,
                                'primary_adult': False,
                                'is_child': True
                            }
                        )
                        id_set.add(item.child.person.person_id)

                id_set = set()
                for item in adult_query:
                    if item.adult.person.person_id not in id_set:
                        result_list.append(
                            {
                                'person_id': item.adult.person.person_id,
                                'first_name': item.adult.person.first_name,
                                'last_name': item.adult.person.last_name,
                                'birth_date': item.adult.person.birth_date,
                                'gender': item.adult.person.ref_gender,
                                'primary_adult': item.primary_adult,
                                'is_child': False
                            }
                        )
                        id_set.add(item.adult.person.person_id)

                return result_list
            elif family_id_strict_filter:
                try:
                    int(family_id_strict_filter)
                except ValueError:
                    return result_list

                adult_query = AdultFamilyRelationship.objects.select_related(
                    'adult__person__ref_gender'
                ).filter(
                    adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(family_id=family_id_strict_filter).order_by(
                    'adult__person__last_name', 'adult__person__first_name'
                )

                id_set = set()
                for item in adult_query:
                    if item.adult.person.person_id not in id_set:
                        result_list.append(
                            {
                                'person_id': item.adult.person.person_id,
                                'first_name': item.adult.person.first_name,
                                'last_name': item.adult.person.last_name,
                                'birth_date': item.adult.person.birth_date,
                                'gender': item.adult.person.ref_gender,
                                'primary_adult': item.primary_adult,
                                'is_child': False
                            }
                        )
                        id_set.add(item.adult.person.person_id)

                return result_list
            elif first_name_filter and not last_name_filter:
                query = AdultFamilyRelationship.objects.select_related(
                    'adult__person__ref_gender'
                ).filter(
                    adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(adult__person__first_name__istartswith=first_name_filter).order_by(
                    'adult__person__last_name', 'adult__person__first_name'
                )
            elif last_name_filter and not first_name_filter:
                query = AdultFamilyRelationship.objects.select_related(
                    'adult__person__ref_gender'
                ).filter(
                    adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(adult__person__last_name__istartswith=last_name_filter).order_by(
                    'adult__person__last_name', 'adult__person__first_name'
                )
            elif first_name_filter and last_name_filter:
                query = AdultFamilyRelationship.objects.select_related(
                    'adult__person__ref_gender'
                ).filter(
                    adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(adult__person__last_name__istartswith=last_name_filter).filter(
                    adult__person__first_name__istartswith=first_name_filter
                ).order_by(
                    'adult__person__last_name', 'adult__person__first_name'
                )
            elif fuzzy_match_filter:
                query = AdultFamilyRelationship.objects.select_related(
                    'adult__person__ref_gender'
                ).filter(
                    adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user))

                id_set = set()
                for item in query:
                    if item.adult.person.person_id not in id_set \
                            and fuzz.partial_ratio(fuzzy_match_filter, (item.adult.person.first_name + ' '
                                                                            + item.adult.person.last_name)) > 70:
                        result_list.append(
                            {
                                'person_id': item.adult.person.person_id,
                                'first_name': item.adult.person.first_name,
                                'last_name': item.adult.person.last_name,
                                'birth_date': item.adult.person.birth_date,
                                'gender': item.adult.person.ref_gender,
                                'primary_adult': item.primary_adult,
                                'is_child': False
                            }
                        )
                        id_set.add(item.adult.person.person_id)

                return result_list
            elif dupes_check_filter:
                query = AdultFamilyRelationship.objects.select_related(
                    'adult__person__ref_gender'
                ).filter(
                    adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user))

                id_set = set()
                for item in query:
                    if item.adult.person.person_id not in id_set \
                            and fuzz.partial_ratio(dupes_check_filter, (item.adult.person.first_name + ' '
                                                                            + item.adult.person.last_name)) > 85:
                        result_list.append(
                            {
                                'person_id': item.adult.person.person_id,
                                'first_name': item.adult.person.first_name,
                                'last_name': item.adult.person.last_name,
                                'birth_date': item.adult.person.birth_date,
                                'gender': item.adult.person.ref_gender,
                                'primary_adult': item.primary_adult,
                                'is_child': False
                            }
                        )
                        id_set.add(item.adult.person.person_id)

                return result_list
            else:
                query = AdultFamilyRelationship.objects.select_related(
                    'adult__person__ref_gender'
                ).filter(
                    adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('adult__person__last_name', 'adult__person__first_name')

        id_set = set()
        for item in query:
            if item.adult.person.person_id not in id_set:
                result_list.append(
                    {
                        'person_id': item.adult.person.person_id,
                        'first_name': item.adult.person.first_name,
                        'last_name': item.adult.person.last_name,
                        'birth_date': item.adult.person.birth_date,
                        'gender': item.adult.person.ref_gender,
                        'primary_adult': item.primary_adult,
                        'is_child': False
                    }
                )
                id_set.add(item.adult.person.person_id)

        return result_list


class ChildSearchList(generics.ListAPIView):
    """
    A read-only list of child records (with a partial subset of fields) viewable by the current user.
    Query parameters:
    Beyond the usual pagination parameters of limit and offset, these options are available:
    - ?first_name=jo - returns children with first names beginning with jo (case insensitive)
    - ?last_name=ba - returns children with last names beginning with ba (case insensitive)
    - ?person_id=123 - returns records with a person ID of exactly 123 (first_name and last_name
    parameters are ignored in this case.)
    - ?family_id=123 - this actually returns all members of the family related to this (both adults
    and children) and is identical to the same parameter passed to adult-search.
    - ?family_id_strict=123 - this returns only the children related to this family
    - ?first_name=jo&last_name=ba - it is possible to filter by both first and last names
    - ?fuzzy_match=Joe Smith - Uses the FuzzyWuzzy library to check first + last name combinations
    against the raw results, returning those with a partial ratio above 75
    - ?dupes_check=Joe Smith - Uses the FuzzyWuzzy library to check first + last name combinations
    against the raw results, returning those wiht a partial ratio above 85
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ChildSearchSerializer

    def get_queryset(self):
        result_list = []

        if len(self.request.query_params) == 0:
            query = ChildFamilyRelationship.objects.select_related(
                'child__person__ref_gender'
            ).filter(
                child__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('child__person__last_name', 'child__person__first_name')

        else:
            person_id_filter = self.request.query_params.get('person_id', None)
            family_id_filter = self.request.query_params.get('family_id', None)
            first_name_filter = self.request.query_params.get('first_name', None)
            last_name_filter = self.request.query_params.get('last_name', None)
            fuzzy_match_filter = self.request.query_params.get('fuzzy_match', None)
            dupes_check_filter = self.request.query_params.get('dupes_check', None)
            family_id_strict_filter = self.request.query_params.get('family_id_strict', None)

            if person_id_filter:
                try:
                    int(person_id_filter)
                except ValueError:
                    return result_list

                query = ChildFamilyRelationship.objects.select_related(
                    'child__person__ref_gender'
                ).filter(
                    child__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(child__person__person_id=person_id_filter).order_by(
                    'child__person__last_name', 'child__person__first_name'
                )
            elif family_id_filter:
                try:
                    int(family_id_filter)
                except ValueError:
                    return result_list

                child_query = ChildFamilyRelationship.objects.select_related(
                    'child__person__ref_gender'
                ).filter(
                    child__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(family_id=family_id_filter).order_by(
                    'child__person__last_name', 'child__person__first_name'
                )

                adult_query = AdultFamilyRelationship.objects.select_related(
                    'adult__person__ref_gender'
                ).filter(
                    adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(family_id=family_id_filter).order_by(
                    'adult__person__last_name', 'adult__person__first_name'
                )

                id_set = set()
                for item in child_query:
                    if item.child.person.person_id not in id_set:
                        result_list.append(
                            {
                            'person_id': item.child.person.person_id,
                            'first_name': item.child.person.first_name,
                            'last_name': item.child.person.last_name,
                            'birth_date': item.child.person.birth_date,
                            'gender': item.child.person.ref_gender,
                            'is_child': True
                            }
                        )
                        id_set.add(item.child.person.person_id)

                id_set = set()
                for item in adult_query:
                    if item.adult.person.person_id not in id_set:
                        result_list.append(
                            {
                            'person_id': item.adult.person.person_id,
                            'first_name': item.adult.person.first_name,
                            'last_name': item.adult.person.last_name,
                            'birth_date': item.adult.person.birth_date,
                            'gender': item.adult.person.ref_gender,
                            'is_child': False
                            }
                        )
                        id_set.add(item.adult.person.person_id)

                return result_list
            elif family_id_strict_filter:
                try:
                    int(family_id_strict_filter)
                except ValueError:
                    return result_list

                child_query = ChildFamilyRelationship.objects.select_related(
                    'child__person__ref_gender'
                ).filter(
                    child__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(family_id=family_id_strict_filter).order_by(
                    'child__person__last_name', 'child__person__first_name'
                )

                id_set = set()
                for item in child_query:
                    if item.child.person.person_id not in id_set:
                        result_list.append(
                            {
                                'person_id': item.child.person.person_id,
                                'first_name': item.child.person.first_name,
                                'last_name': item.child.person.last_name,
                                'birth_date': item.child.person.birth_date,
                                'gender': item.child.person.ref_gender,
                                'primary_adult': False,
                                'is_child': True
                            }
                        )
                        id_set.add(item.child.person.person_id)

                return result_list
            elif first_name_filter and not last_name_filter:
                query = ChildFamilyRelationship.objects.select_related(
                    'child__person__ref_gender'
                ).filter(
                    child__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(child__person__first_name__istartswith=first_name_filter).order_by(
                    'child__person__last_name', 'child__person__first_name'
                )
            elif last_name_filter and not first_name_filter:
                query = ChildFamilyRelationship.objects.select_related(
                    'child__person__ref_gender'
                ).filter(
                    child__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(child__person__last_name__istartswith=last_name_filter).order_by(
                    'child__person__last_name', 'child__person__first_name'
                )
            elif first_name_filter and last_name_filter:
                query = ChildFamilyRelationship.objects.select_related(
                    'child__person__ref_gender'
                ).filter(
                    child__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(child__person__last_name__istartswith=last_name_filter).filter(
                    child__person__first_name__istartswith=first_name_filter
                ).order_by(
                    'child__person__last_name', 'child__person__first_name'
                )
            elif fuzzy_match_filter:
                query = ChildFamilyRelationship.objects.select_related(
                    'child__person__ref_gender'
                ).filter(
                    child__person__organization__in=Organization.objects.get_read_orgs(self.request.user))

                id_set = set()
                for item in query:
                    if item.child.person.person_id not in id_set \
                            and fuzz.partial_ratio(fuzzy_match_filter, (item.child.person.first_name + ' '
                                                                            + item.child.person.last_name)) > 75:
                        result_list.append(
                            {
                                'person_id': item.child.person.person_id,
                                'first_name': item.child.person.first_name,
                                'last_name': item.child.person.last_name,
                                'birth_date': item.child.person.birth_date,
                                'gender': item.child.person.ref_gender,
                                'is_child': True
                            }
                        )
                        id_set.add(item.child.person.person_id)

                return result_list
            elif dupes_check_filter:
                query = ChildFamilyRelationship.objects.select_related(
                    'child__person__ref_gender'
                ).filter(
                    child__person__organization__in=Organization.objects.get_read_orgs(self.request.user))

                id_set = set()
                for item in query:
                    if item.child.person.person_id not in id_set \
                            and fuzz.partial_ratio(dupes_check_filter, (item.child.person.first_name + ' '
                                                                            + item.child.person.last_name)) > 85:
                        result_list.append(
                            {
                                'person_id': item.child.person.person_id,
                                'first_name': item.child.person.first_name,
                                'last_name': item.child.person.last_name,
                                'birth_date': item.child.person.birth_date,
                                'gender': item.child.person.ref_gender,
                                'is_child': True
                            }
                        )
                        id_set.add(item.child.person.person_id)

                return result_list
            else:
                query = ChildFamilyRelationship.objects.select_related(
                    'child__person__ref_gender'
                ).filter(
                    child__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('child__person__last_name', 'child__person__first_name')

        id_set = set()
        for item in query:
            if item.child.person.person_id not in id_set:
                result_list.append(
                    {
                        'person_id': item.child.person.person_id,
                        'first_name': item.child.person.first_name,
                        'last_name': item.child.person.last_name,
                        'birth_date': item.child.person.birth_date,
                        'gender': item.child.person.ref_gender,
                        'is_child': True
                    }
                )
                id_set.add(item.child.person.person_id)

        return result_list
