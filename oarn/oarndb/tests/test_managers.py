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
from django.contrib.auth.models import User, Group

from oarndb.models import Organization

from oarndb.models import Person, RefRole, OrganizationPersonRole
from oarndb.models import Child, Adult, Family, OrganizationFamilyLink

class SecureManagerTestCase(TestCase):

    def setUp(self):
        """
        We need to set up the following:
        1) eight security groups:
            a) fbb_readonly
            b) fbb_readwrite
            c) fbb_admin
            d) mtn_readonly
            e) mtn_readwrite
            f) mtn_admin
            g) global_readonly
            h) global_admin
        2) two organizations: FBB and MTN
        3) five users:
            a) one user has read only access to FBB and no access to MTN
            b) one user with read/write access to MTN and read only access to
               FBB
            c) one user with global read only access
            d) one user with global admin access
            e) one user with admin rights to FBB and no access to MTN
        """
        # Set up security groups:
        self.fbb_readonly = Group.objects.create(name='fbb_readonly')
        self.fbb_readwrite = Group.objects.create(name='fbb_readwrite')
        self.fbb_admin = Group.objects.create(name='fbb_admin')
        self.mtn_readonly = Group.objects.create(name='mtn_readonly')
        self.mtn_readwrite = Group.objects.create(name='mtn_readwrite')
        self.mtn_admin = Group.objects.create(name='mtn_admin')
        self.global_readonly = Group.objects.create(name='global_readonly')
        self.global_admin = Group.objects.create(name='global_admin')

        # Set up organizations:
        self.fbb = Organization.objects.create(
            name='Family Building Blocks',
            short_name='FBB',
            read_only_group=self.fbb_readonly,
            read_write_group=self.fbb_readwrite,
            admin_group=self.fbb_admin
        )
        self.mtn = Organization.objects.create(
            name='Mountain Star',
            short_name='MTN',
            read_only_group=self.mtn_readonly,
            read_write_group=self.mtn_readwrite,
            admin_group=self.mtn_admin
        )

        # Set up users:
        # a) one user has read/write only access to FBB and no access to MTN
        self.user_a = User.objects.create_user(
            username='user_a'
        )
        self.fbb_readonly.user_set.add(self.user_a)

        #b) one user with read/write access to MTN and read only access to
        #       FBB
        self.user_b = User.objects.create_user(
            username='user_b'
        )
        self.mtn_readwrite.user_set.add(self.user_b)
        self.fbb_readonly.user_set.add(self.user_b)

        #c) one user with global read only access
        self.user_c = User.objects.create_user(
            username='user_c'
        )
        self.global_readonly.user_set.add(self.user_c)

        #d) one user with global admin access
        self.user_d = User.objects.create_user(
            username='user_d'
        )
        self.global_admin.user_set.add(self.user_d)

        #e) one user with admin rights to FBB and no access to MTN
        self.user_e = User.objects.create_user(
            username='user_e'
        )
        self.fbb_admin.user_set.add(self.user_e)

        # For Person tests:
        # Set up a role:
        self.role = RefRole.objects.create(description="Role", code="R", sort_order=1.0)
        # create a person record:
        self.joe = Person.objects.create(first_name='Joe', last_name='Smith')
        self.mary = Person.objects.create(first_name='Mary', last_name='Jones')
        # link the person to fbb:
        OrganizationPersonRole.objects.create(person=self.joe, ref_role=self.role, 
            organization=self.fbb)
        OrganizationPersonRole.objects.create(person=self.mary, ref_role=self.role, 
            organization=self.fbb)

        # For Child tests:
        # joe is a child:
        self.child = Child.objects.create(person=self.joe)
        
        # For Adult tests:
        # mary is an adult:
        self.adult = Adult.objects.create(person=self.mary)

        # For Family tests:
        self.family = Family.objects.create()
        OrganizationFamilyLink.objects.create(family=self.family, organization=self.fbb)


    def test_secure_manager(self):
        """
        Do we get the correct organizations returned by the get_read_orgs 
        and get_readwrite_orgs methods?
        """
        # a) one user has read/write only access to FBB and no access to MTN
        orgs = Organization.objects.get_read_orgs(self.user_a)
        self.assertEqual(
            orgs.filter(name='Family Building Blocks').count(),
            1
        )
        self.assertEqual(
            orgs.filter(name='Mountain Star').count(),
            0
        )

        #b) one user with read/write access to MTN and read only access to
        #       FBB
        orgs = Organization.objects.get_readwrite_orgs(self.user_b)
        self.assertEqual(
            orgs.filter(name='Family Building Blocks').count(),
            0
        )
        self.assertEqual(
            orgs.filter(name='Mountain Star').count(),
            1
        )

        #c) one user with global read only access
        orgs = Organization.objects.get_read_orgs(self.user_c)
        self.assertEqual(
            orgs.all().count(),
            2
        )

        orgs = Organization.objects.get_readwrite_orgs(self.user_c)
        self.assertEqual(
            orgs.all().count(),
            0
        )

        #d) one user with global admin access
        orgs = Organization.objects.get_readwrite_orgs(self.user_d)
        self.assertEqual(
            orgs.all().count(),
            2
        )

        orgs = Organization.objects.get_read_orgs(self.user_d)
        self.assertEqual(
            orgs.all().count(),
            2
        )

        #e) one user with admin rights to FBB and no access to MTN
        orgs = Organization.objects.get_readwrite_orgs(self.user_e)
        self.assertEqual(
            orgs.filter(name='Family Building Blocks').count(),
            1
        )
        self.assertEqual(
            orgs.filter(name='Mountain Star').count(),
            0
        )

        orgs = Organization.objects.get_read_orgs(self.user_e)
        self.assertEqual(
            orgs.filter(name='Family Building Blocks').count(),
            1
        )
        self.assertEqual(
            orgs.filter(name='Mountain Star').count(),
            0
        )

    def test_get_permissions_person(self):
        """
        Does the SecureManager's get_permissions method return the correct
        results for a Person record?
        """

        # a) one user has read only access to FBB and no access to MTN
        result = Organization.objects.get_permissions(self.user_a, self.joe)
        self.assertTrue(result['read'])
        self.assertFalse(result['write'])

        # b) one user with read/write access to MTN and read only access to
        #    FBB
        result = Organization.objects.get_permissions(self.user_b, self.joe)
        self.assertTrue(result['read'])
        self.assertFalse(result['write'])

        # c) one user with global read only access
        result = Organization.objects.get_permissions(self.user_c, self.joe)
        self.assertTrue(result['read'])
        self.assertFalse(result['write'])

        # d) one user with global admin access
        result = Organization.objects.get_permissions(self.user_d, self.joe)
        self.assertTrue(result['read'])
        self.assertTrue(result['write'])

        # e) one user with admin rights to FBB and no access to MTN
        result = Organization.objects.get_permissions(self.user_e, self.joe)
        self.assertTrue(result['read'])
        self.assertTrue(result['write'])

    def test_get_permissions_child(self):
        """
        Does the SecureManager's get_permissions method return the correct
        results for a Child record?
        """

        # a) one user has read only access to FBB and no access to MTN
        result = Organization.objects.get_permissions(self.user_a, self.child)
        self.assertTrue(result['read'])
        self.assertFalse(result['write'])

        # b) one user with read/write access to MTN and read only access to
        #    FBB
        result = Organization.objects.get_permissions(self.user_b, self.child)
        self.assertTrue(result['read'])
        self.assertFalse(result['write'])

        # c) one user with global read only access
        result = Organization.objects.get_permissions(self.user_c, self.child)
        self.assertTrue(result['read'])
        self.assertFalse(result['write'])

        # d) one user with global admin access
        result = Organization.objects.get_permissions(self.user_d, self.child)
        self.assertTrue(result['read'])
        self.assertTrue(result['write'])

        # e) one user with admin rights to FBB and no access to MTN
        result = Organization.objects.get_permissions(self.user_e, self.child)
        self.assertTrue(result['read'])
        self.assertTrue(result['write'])


    def test_get_permissions_adult(self):
        """
        Does the SecureManager's get_permissions method return the correct
        results for an Adult record?
        """

        # a) one user has read only access to FBB and no access to MTN
        result = Organization.objects.get_permissions(self.user_a, self.adult)
        self.assertTrue(result['read'])
        self.assertFalse(result['write'])

        # b) one user with read/write access to MTN and read only access to
        #    FBB
        result = Organization.objects.get_permissions(self.user_b, self.adult)
        self.assertTrue(result['read'])
        self.assertFalse(result['write'])

        # c) one user with global read only access
        result = Organization.objects.get_permissions(self.user_c, self.adult)
        self.assertTrue(result['read'])
        self.assertFalse(result['write'])

        # d) one user with global admin access
        result = Organization.objects.get_permissions(self.user_d, self.adult)
        self.assertTrue(result['read'])
        self.assertTrue(result['write'])

        # e) one user with admin rights to FBB and no access to MTN
        result = Organization.objects.get_permissions(self.user_e, self.adult)
        self.assertTrue(result['read'])
        self.assertTrue(result['write'])

    def test_get_permissions_family(self):
        """
        Does the SecureManager's get_permissions method return the correct
        results for a Family record?
        """

        # a) one user has read only access to FBB and no access to MTN
        result = Organization.objects.get_permissions(self.user_a, self.family)
        self.assertTrue(result['read'])
        self.assertFalse(result['write'])

        # b) one user with read/write access to MTN and read only access to
        #    FBB
        result = Organization.objects.get_permissions(self.user_b, self.family)
        self.assertTrue(result['read'])
        self.assertFalse(result['write'])

        # c) one user with global read only access
        result = Organization.objects.get_permissions(self.user_c, self.family)
        self.assertTrue(result['read'])
        self.assertFalse(result['write'])

        # d) one user with global admin access
        result = Organization.objects.get_permissions(self.user_d, self.family)
        self.assertTrue(result['read'])
        self.assertTrue(result['write'])

        # e) one user with admin rights to FBB and no access to MTN
        result = Organization.objects.get_permissions(self.user_e, self.family)
        self.assertTrue(result['read'])
        self.assertTrue(result['write'])
        
