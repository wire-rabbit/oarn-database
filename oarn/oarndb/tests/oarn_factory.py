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

import string
import random
from datetime import date, datetime, timedelta

from django.contrib.auth.models import User, Group

from rest_framework.test import APIClient

from oarndb.models import Person, Adult, Child, PersonRace
from oarndb.models import Family, AdultFamilyRelationship, ChildFamilyRelationship
from oarndb.models import Organization, OrganizationPersonRole, OrganizationFamilyLink
from oarndb.models import RefGender, RefRole, RefAdultFamilyRelationshipType, RefChildFamilyRelationshipType
from oarndb.models import CaseManager, FamilyAddress
from oarndb.models import RefState, RefCounty, RefLocationType, RefLanguage, RefLanguageUseType
from oarndb.models import PersonLanguage, PersonTelephone, RefPersonTelephoneNumberType
from oarndb.models import PersonEmailAddress, RefEmailType
from oarndb.models import RefProgram, FamilyEnrollment, OrganizationLocation
from oarndb.models import PersonEnrollment, ServiceLevelEnrollment, RefServiceLevel
from oarndb.models import RefHomeVisitLocation, RefContactType


class OarnFactory():
    """
    Produces OARN database test data on demand.
    """

    def __init__(self):
        """
        Loads the basic data used everywhere.

        :return:
        """
        self.female = RefGender.objects.create(
            description='Female', code='F', sort_order=1.0, universal=True
        )

        self.male = RefGender.objects.create(
            description='Male', code='M', sort_order=2.0, universal=True
        )

        self.client_role = RefRole.objects.create(
            description='Client', code='C', sort_order=1.0, universal=True
        )
        self.staff_role = RefRole.objects.create(
            description='Staff', code='S', sort_order=2.0, universal=True
        )

        self.bio_parent_rel_type = RefAdultFamilyRelationshipType.objects.create(
            description='Biological Parent', code='B', sort_order=1.0, universal=True
        )

        self.bio_child_rel_type = RefChildFamilyRelationshipType.objects.create(
            description='Biological Child', code='B', sort_order=1.0, universal=True
        )

        self.state_or = RefState.objects.create(
            description='Oregon', code='OR', sort_order=1.0, universal=True
        )

        self.county_marion = RefCounty.objects.create(
            description='Marion', code='MA', sort_order=1.0, universal=True
        )

        self.location_type_home = RefLocationType.objects.create(
            description='Home', code='H', sort_order=1.0, universal=True
        )

        self.language_english = RefLanguage.objects.create(
            description='English', code='ENG', sort_order=1.0, universal=True
        )

        self.language_use_type_home = RefLanguageUseType.objects.create(
            description='Home', code='H', sort_order=1.0, universal=True
        )

        self.telephone_type = RefPersonTelephoneNumberType.objects.create(
            description='Home', code='H', sort_order=1.0, universal=True
        )

        self.email_type = RefEmailType.objects.create(
            description='Personal', code='P', sort_order=1.0, universal=True
        )

        self.classroom_program = RefProgram.objects.create(
            description='Classroom', code='C', sort_order=1.0, universal=True
        )

        self.intensive_service_level = RefServiceLevel.objects.create(
            description='Intensive', code='I', sort_order=1.0, ref_program=self.classroom_program
        )

        self.home_visit_location = RefHomeVisitLocation.objects.create(
            description='Home', code='H', sort_order=1.0, universal=True
        )

        self.telephone_contact = RefContactType.objects.create(
            description='Telephone', code='T', sort_order=1.0, universal=True
        )

        # set up security groups:
        self.global_admin = Group.objects.create(name='global_admin')
        self.global_readonly = Group.objects.create(name='global_readonly')
        self.fbb_readonly = Group.objects.create(name='fbb_readonly')
        self.fbb_readwrite = Group.objects.create(name='fbb_readwrite')
        self.fbb_admin = Group.objects.create(name='fbb_admin')
        self.mtn_readonly = Group.objects.create(name='mtn_readonly')
        self.mtn_readwrite = Group.objects.create(name='mtn_readwrite')
        self.mtn_admin = Group.objects.create(name='mtn_admin')

        # set up two orgs, FBB and MTN:
        self.fbb = Organization.objects.create(name='FBB', short_name='fbb',
                                               read_only_group=self.fbb_readonly,
                                               read_write_group=self.fbb_readwrite,
                                               admin_group=self.fbb_admin)

        self.mtn = Organization.objects.create(name='MTN', short_name='mtn',
                                               read_only_group=self.mtn_readonly,
                                               read_write_group=self.mtn_readwrite,
                                               admin_group=self.mtn_admin)

        # set up users:
        self.global_admin_user = User.objects.create(username='global_admin_user')
        self.global_admin.user_set.add(self.global_admin_user)

        self.global_readonly_user = User.objects.create(username='global_readonly_user')
        self.global_readonly.user_set.add(self.global_readonly_user)

        self.fbb_readonly_user = User.objects.create(username='fbb_readonly_user')
        self.fbb_readonly.user_set.add(self.fbb_readonly_user)

        self.fbb_readwrite_user = User.objects.create(username='fbb_readwrite_user')
        self.fbb_readwrite.user_set.add(self.fbb_readwrite_user)

        self.fbb_admin_user = User.objects.create(username='fbb_admin_user')
        self.fbb_admin.user_set.add(self.fbb_admin_user)

        self.mtn_readonly_user = User.objects.create(username='mtn_readonly_user')
        self.mtn_readonly.user_set.add(self.mtn_readonly_user)

        self.mtn_readwrite_user = User.objects.create(username='mtn_readwrite_user')
        self.mtn_readwrite.user_set.add(self.mtn_readwrite_user)

        self.mtn_admin_user = User.objects.create(username='mtn_admin_user')
        self.mtn_admin.user_set.add(self.mtn_admin_user)

        # set up clients:
        self.global_readonly_client = APIClient()
        self.global_readonly_client.force_authenticate(user=self.global_readonly_user)

        self.global_admin_client = APIClient()
        self.global_admin_client.force_authenticate(user=self.global_admin_user)

        self.fbb_readonly_client = APIClient()
        self.fbb_readonly_client.force_authenticate(user=self.fbb_readonly_user)

        self.fbb_readwrite_client = APIClient()
        self.fbb_readwrite_client.force_authenticate(user=self.fbb_readwrite_user)

        self.fbb_admin_client = APIClient()
        self.fbb_admin_client.force_authenticate(user=self.fbb_admin_user)

        self.mtn_readonly_client = APIClient()
        self.mtn_readonly_client.force_authenticate(user=self.mtn_readonly_user)

        self.mtn_readwrite_client = APIClient()
        self.mtn_readwrite_client.force_authenticate(user=self.mtn_readwrite_user)

        self.mtn_admin_client = APIClient()
        self.mtn_admin_client.force_authenticate(user=self.mtn_admin_user)

        # Organziation Locations:
        self.fbb_site = OrganizationLocation.objects.create(
            organization=self.fbb,
            name='FBB Site',
            short_name='FS',
            street_number_and_name='123 Any Ave',
            city='Salem',
            ref_state=self.state_or,
            postal_code='97305',
            ref_county=self.county_marion
        )

        self.mtn_site = OrganizationLocation.objects.create(
            organization=self.mtn,
            name='MTN Site',
            short_name='MS',
            street_number_and_name='123 Other Ave',
            city='Bend',
            ref_state=self.state_or,
            postal_code='97305',
            ref_county=self.county_marion
        )

    def rand_string(self, len=10):
        """
        returns a random,first-letter-capitalized string of len length.

        :param len:
        :return:
        """

        return ''.join(random.choice(string.ascii_lowercase) for _ in range(len)).capitalize()

    def rand_instance(self, model):
        """
        returns a random selection from the supplied model.
        :param model:
        :return:
        """
        return random.choice(list(model.objects.all()))

    def rand_date(self, years=1):
        """
        returns a random date from within the last 'years' years.
        :return: date
        """

        return date.today() - timedelta(days=random.randint(1, (365*years)))

    def rand_child_dob(self):
        """
        returns a random date from within the last 5 years.
        :return: date
        """

        return date.today() - timedelta(days=random.randint(1, (365*5)))

    def rand_adult_dob(self):
        """
        returns a random date from 17 to 40 years ago.
        :return: date
        """

        return date.today() - timedelta(days=random.randint((365*17), (365*40)))

    def rand_staff(self, org):
        """
        returns a random Person record that has a staff role for the given org.

        :param org:
        :return:
        """

        all_staff = list(Person.objects.filter(
            organizationpersonrole__ref_role=self.staff_role
        ).filter(organization=org))

        if len(all_staff) == 0:
            return None
        else:
            return random.choice(all_staff)

    def rand_client(self, org):
        """
        returns a random Person record that has a client role for the given org.

        :param org:
        :return:
        """

        all_clients = list(Person.objects.filter(
            organizationpersonrole__ref_role=self.client_role
        ).filter(organization=org))

        if len(all_clients) == 0:
            return None
        else:
            return random.choice(all_clients)

    def rand_family(self, org):
        """
        returns a random Family record linked to the given org.

        :param org:
        :return:
        """

        all_families = list(Family.objects.filter(organizationfamilylink__organization=org))

        if len(all_families) == 0:
            return None
        else:
            return random.choice(all_families)

    def rand_person(self, org):
        """
        returns a random Person record linked to the given org

        :param org:
        :return:
        """

        all_people = list(Person.objects.filter(organization=org))

        if len(all_people) == 0:
            return None
        else:
            return random.choice(all_people)

    def rand_case_manager(self, org):
        """
        returns a random case manager record linked to the given org.

        :param org:
        :return:
        """

        all_cms = list(CaseManager.objects.filter(family__organizationfamilylink__organization=org))

        if len(all_cms) == 0:
            return None
        else:
            return random.choice(all_cms)

    def rand_address(self, org):
        """
        returns a random address record linked to the given org.

        :param org:
        :return:
        """
        all_addr = list(FamilyAddress.objects.filter(family__organizationfamilylink__organization=org))

        if len(all_addr) == 0:
            return None
        else:
            return random.choice(all_addr)

    def get_primary_adult(self, family):
        """
        returns the person record set as the primary for the supplied family
        :param family:
        :return:
        """
        afr = AdultFamilyRelationship.objects.filter(family=family).filter(primary_adult=True).first()
        return afr.adult.person

    def get_children(self, family):
        """
        returns a queryset containing all the children linked to a given family
        :param family:
        :return:
        """
        return Child.objects.filter(childfamilyrelationship__family=family)

    def new_person(self, org, is_client=True, is_child=False, has_race=True, has_language=True,
                   has_telephone=True, has_email=True):
        """
        Creates and returns a new Person record linked to the supplied organization,
        :param org:
        :param is_client:
        :param is_child:
        :return: Person
        """
        if is_child:
            dob = self.rand_child_dob()
        else:
            dob = self.rand_adult_dob()

        person = Person.objects.create(
            first_name=self.rand_string(),
            last_name=self.rand_string(),
            ref_gender=self.rand_instance(RefGender),
            birth_date=dob
        )

        if is_child:
            Child.objects.create(
                person=person
            )
        else:
            Adult.objects.create(
                person=person
            )

        if is_client:
            role = self.client_role
        else:
            role = self.staff_role

        OrganizationPersonRole.objects.create(
            person=person,
            organization=org,
            ref_role=role
        )

        if has_race:
            PersonRace.objects.create(
                person=person,
                hispanic_latino_ethnicity=random.choice([True, False]),
                american_indian=random.choice([True, False]),
                asian=random.choice([True, False]),
                black=random.choice([True, False]),
                pacific=random.choice([True, False]),
                white=random.choice([True, False]),
                other=random.choice([True, False])
            )

        if has_language:
            PersonLanguage.objects.create(
                person=person,
                ref_language=self.language_english,
                ref_language_use_type=self.language_use_type_home
            )

        if has_telephone:
            PersonTelephone.objects.create(
                person=person,
                ref_person_telephone_number_type=self.telephone_type,
                telephone_number=self.rand_string()
            )

        if has_email:
            PersonEmailAddress.objects.create(
                person=person,
                ref_email_type=self.email_type,
                email_address=self.rand_string() + '@' + self.rand_string() + '.org'
            )

        return person

    def new_basic_family(self, org, is_enrolled=True):
        """
        Creates and returns a simple family with one primary adult and one biological child,
        and one address, linked to the supplied organization.

        :param org:
        :return:
        """
        family = Family.objects.create()

        primary_adult = self.new_person(org)
        adult = Adult.objects.get(person=primary_adult)
        AdultFamilyRelationship.objects.create(
            adult=adult,
            family=family,
            primary_adult=True,
            ref_adult_family_relationship_type=self.bio_parent_rel_type
        )

        child = self.new_person(org, is_child=True)
        child = Child.objects.get(person=child)
        ChildFamilyRelationship.objects.create(
            child=child,
            family=family,
            ref_child_family_relationship_type=self.bio_child_rel_type
        )

        OrganizationFamilyLink.objects.create(
            family=family,
            organization=org
        )

        self.new_family_address(family)

        if is_enrolled and org == self.fbb:
            enr = FamilyEnrollment.objects.create(
                family=family,
                ref_program=self.classroom_program,
                location=self.fbb_site,
                open_date=self.rand_child_dob(),
                close_date=None
            )

        if is_enrolled and org == self.mtn:
            enr = FamilyEnrollment.objects.create(
                family=family,
                ref_program=self.classroom_program,
                location=self.mtn_site,
                open_date=self.rand_child_dob(),
                close_date=None
            )

        if is_enrolled:
            PersonEnrollment.objects.create(
                person=primary_adult,
                family_enrollment=enr,
                open_date=self.rand_child_dob(),
                close_date=None
            )

            PersonEnrollment.objects.create(
                person=child.person,
                family_enrollment=enr,
                open_date=self.rand_child_dob(),
                close_date=None
            )

            ServiceLevelEnrollment.objects.create(
                family_enrollment=enr,
                ref_service_level=self.intensive_service_level,
                open_date=self.rand_child_dob(),
                close_date=None
            )

        return family

    def new_case_manager(self, family, org):
        """
        Creates new staff person, links that record to the family via CaseManager and returns the CaseManager record.

        :param family:
        :param org:
        :return:
        """

        casemanager = self.new_person(org, is_client=False, is_child=False)

        startdate = self.rand_child_dob() # Get a date within the last five years

        # lets make about 40% of the case managers still open:
        enddate = None
        if random.randint(1, 10) not in [1,2, 3, 4]:
            delta = date.today() - startdate
            enddate = startdate + timedelta(days=random.randint(1, delta.days))

        return CaseManager.objects.create(
            family=family,
            person=casemanager,
            begin_date=startdate,
            end_date=enddate
        )

    def new_family_address(self, family):
        """
        Creates a new family address record and links that record to the family.
        :param family:
        :return:
        """

        end_date = None
        if random.randint(1,10) < 5:
            end_date = self.rand_date(5)

        return FamilyAddress.objects.create(
            family=family,
            ref_location_type=self.location_type_home,
            street_number_and_name=self.rand_string(),
            apartment_room_or_suite_number=self.rand_string(),
            city=self.rand_string(),
            ref_state=self.state_or,
            postal_code=self.rand_string(),
            ref_county=self.county_marion,
            residence_end_date=end_date,
            primary_address=True,
            notes=self.rand_string(len=100)
        )