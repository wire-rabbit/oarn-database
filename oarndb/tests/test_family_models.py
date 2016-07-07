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

from django.test import TestCase

from oarndb.models import Person
from oarndb.models import Child
from oarndb.models import Adult
from oarndb.models import Family
from oarndb.models import AdultFamilyRelationship
from oarndb.models import ChildFamilyRelationship
from oarndb.models import AdultChildRelationship
from oarndb.models import PersonDemographicRace
from oarndb.models import PersonLanguage
from oarndb.models import PersonPregnancy
from oarndb.models import ChildPregnancyRelationship
from oarndb.models import PersonTelephone
from oarndb.models import PersonEmailAddress
from oarndb.models import FamilyAddress

from oarndb.models import Organization
from oarndb.models import RefCounty
from oarndb.models import RefState
from oarndb.models import RefGender
from oarndb.models import RefChildFamilyRelationshipType
from oarndb.models import RefAdultChildRelationshipType
from oarndb.models import RefRace
from oarndb.models import RefLanguage
from oarndb.models import RefLanguageUseType
from oarndb.models import RefPersonTelephoneNumberType
from oarndb.models import RefEmailType
from oarndb.models import RefLocationType

class FamilyModelsTest(TestCase):
    """
    I want to avoid testing Django framework elements, so I will only test 
    logic that I implement myself. For these tables this primarily means
    that the __str__ method of each model is returning a valid value.
    """

    def setUp(self):
        """
        Create an adult, child, a family and assorted lookup tables 
        for use in the tests.
        """

        self.fbb = Organization(
            name='Family Building Blocks',
            short_name='FBB',
        )
        self.fbb.save()

        self.marion = RefCounty(
            description="Marion County",
            code="MAR",
            definition="Marion County",
            sort_order=1.0
        )
        self.marion.save()

        self.oregon = RefState(
            description="Oregon",
            code="OR",
            definition="Oregon State",
            sort_order=1.0
        )
        self.oregon.save()

        self.apartment = RefLocationType(
            description="Apartment",
            code="A",
            definition="Apartment",
            sort_order=2.0
        )
        self.apartment.save()

        self.female = RefGender(
            description="Female",
            code="F",
            definition="Female",
            sort_order=1.0
        )
        self.female.save()

        self.white = RefRace(
            description="White",
            code="W",
            definition="Caucasian",
            sort_order=1.0
        )
        self.white.save()

        self.english = RefLanguage(
            description="English",
            code="E",
            definition="English",
            sort_order=1.0
        )
        self.english.save()

        self.home = RefLanguageUseType(
            description="Home",
            code="H",
            definition="Home",
            sort_order=1.0
        )
        self.home.save()

        self.home_email = RefEmailType(
            description="Home Email",
            code="H",
            definition="Home Email",
            sort_order=1.0
        )
        self.home_email.save()

        self.cell = RefPersonTelephoneNumberType(
            description="Cell",
            code="C",
            definition="Cell phone",
            sort_order=1.0
        )
        self.cell.save()

        self.adult = Person(
            first_name="Wilma",
            middle_name="Neander",
            last_name="Flintstone",
            ref_gender=self.female
        )
        self.adult.save()

        self.child = Person(
            first_name='Pebbles',
            last_name='Rubble',
            ref_gender=self.female
        )
        self.child.save()

        self.family = Family()
        self.family.save()

        self.foster_child = RefChildFamilyRelationshipType(
            description="Foster",
            code="F",
            definition="Foster child",
            sort_order=1.0
        )
        self.foster_child.save()
        
        self.adoptive_parent = RefAdultChildRelationshipType(
            description="Adoptive",
            code="A",
            definition="Adoptive Parent",
            sort_order=1.0
        ) 
        self.adoptive_parent.save()

    def test_person_model(self):
        # Person:
        test_str = Person.objects.filter(
            last_name='Flintstone'
        )[0].__str__()
        self.assertIn('Flintstone', test_str)

    def test_adult_model(self):
        # Adult:
        Adult.objects.create(person=self.adult)
        test_str = Adult.objects.get(person=self.adult).__str__()
        self.assertIn('Flintstone', test_str)

    def test_child_model(self):
        # Child:
        Child.objects.create(person=self.child)
        test_str = Child.objects.get(person=self.child).__str__()
        self.assertIn('Rubble', test_str)

    def test_family_model(self):
        # Family:
        test_str = Family.objects.all().first().__str__()
        self.assertIn(str(Family.objects.all().first().family_id), test_str)

    def test_adult_family_relationship_model(self):
        # AdultFamilyRelationship:
        Adult.objects.create(person=self.adult)

        AdultFamilyRelationship.objects.create(
            adult=Adult.objects.all().first(),
            family=Family.objects.all().first()
        )
        test_str = AdultFamilyRelationship.objects.all().first().__str__()
        self.assertIn('Flintstone', test_str)

    def test_child_family_relationship_model(self):
        # ChildFamilyRelationship:
        Child.objects.create(person=self.child)

        ChildFamilyRelationship.objects.create(
            child=Child.objects.get(person=self.child),
            family=Family.objects.all().first(),
            ref_child_family_relationship_type = self.foster_child
        )
        test_str = ChildFamilyRelationship.objects.all().first().__str__()
        self.assertIn('Rubble', test_str)

    def test_adult_child_relationship_model(self):
        # AdultChildRelationship:
        a = Adult.objects.create(person=self.adult)
        c = Child.objects.create(person=self.child)

        AdultChildRelationship.objects.create(
            adult=Adult.objects.get(person=self.adult),
            child=Child.objects.get(person=self.child),
            ref_adult_child_relationship_type=self.adoptive_parent
        )
        test_str = AdultChildRelationship.objects.all().first().__str__()
        self.assertIn('Flintstone', test_str) # Is the adult present?
        self.assertIn('Rubble', test_str) # Is the child present?

    def test_person_demographic_race_model(self):
        # PersonDemographicRace:
        PersonDemographicRace.objects.create(
            person=self.adult,
            ref_race=self.white
        )
        test_str = PersonDemographicRace.objects.all().first().__str__()
        self.assertIn('Flintstone', test_str) # Is the person present?
        self.assertIn('White', test_str) # Is the related race present?

    def test_person_language_model(self):
         # PersonLanguage:
        PersonLanguage.objects.create(
            person=self.adult,
            ref_language=self.english,
            ref_language_use_type=self.home
        )
        test_str = PersonLanguage.objects.all().first().__str__()
        self.assertIn('Flintstone', test_str) # Is the person present?
        self.assertIn('English', test_str) # Is the language present?
        self.assertIn('Home', test_str) # Is the language use type present?

    def test_person_pregnancy_model(self):
        # PersonPregnancy:
        a = Adult.objects.create(person=self.adult)
        c = Child.objects.create(person=self.child)
        p = PersonPregnancy.objects.create(adult=Adult.objects.get(person=self.adult))

        test_str = p.__str__()
        self.assertIn('Flintstone', test_str) # Is the adult present?

        # ChildPregnancyRelationship:
        cpr = ChildPregnancyRelationship.objects.create(
            person_pregnancy = p,
            child = Child.objects.get(person=c)
        )

        test_str = cpr.__str__()
        self.assertIn('Pebbles', test_str) # Is the child present?
        self.assertIn('Wilma', test_str) # Is the mother present?

    def test_person_telephone_model(self):
        # PersonTelephone:
        pt = PersonTelephone.objects.create(
            person=self.adult,
            ref_person_telephone_number_type=self.cell,
            telephone_number='503-566-2132'
        )

        test_str = pt.__str__()
        self.assertIn('Flintstone', test_str) # Is the person present?
        self.assertIn('2132', test_str) # Is the number present?
        self.assertIn('Cell', test_str) # Is the phone type present?

    def test_person_email_address_model(self):
        # PersonEmailAddress:
        pe = PersonEmailAddress.objects.create(
            person=self.adult,
            ref_email_type=self.home_email,
            email_address='foo.bar@gmail.com',
        )
        test_str = pe.__str__()
        self.assertIn('Flintstone', test_str) # Is the person present?
        self.assertIn('foo.bar@gmail.com', test_str) # Is the email present?
        self.assertIn('Home Email', test_str) # Is the type of email present?

    def test_family_address_model(self):
        # FamilyAddress:
        fa = FamilyAddress.objects.create(
            family = self.family,
            ref_location_type = self.apartment,
            street_number_and_name='123 Evergreen Terrace',
            apartment_room_or_suite_number='#3',
            city='Rockville',
            ref_state=self.oregon,
            postal_code = '78293',
            ref_county=self.marion
        )

        test_str = fa.__str__()
        self.assertIn('1', test_str) # Is the family correct?



