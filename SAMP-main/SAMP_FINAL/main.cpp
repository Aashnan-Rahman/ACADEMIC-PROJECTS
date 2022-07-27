#include <iostream>
#include<fstream>
#include "Student.h"
using namespace std;

extern authorization();

string access_ID,access_pass;

void access();

void showAll()
{
    string str;
    ifstream student("student.txt");
    if(!student)
    {
        cout<<"File Not Found\n"<<endl;
    }
    else
    {
        cout<<endl<<endl<<"Student Details"<<endl;
        while(getline(student,str))
        {
            cout<<str<<endl;
        }

        student.close();
    }
}



void access()
{
    string str=access_ID;
    int x;

    if (str.size()==9) /// student
    {
        /// view details, view grade, view routine
        cout<<"Choose one of the following options :"<<endl;
        cout<<" 1. View Student Details "<<endl;
        cout<<" 2. View Student Grade "<<endl;   /// semester-wise
        cout<<" 3. Change password "<<endl;
        cout<<" 4. View Routine "<<endl<<endl;

        cout<<"Enter your choice : ";
        cin>>x;

        if(x==1)
        {
            accessDetails(str);
        }
        else if(x==2)
        {

        }
        else if(x==3)
        {
            edit_password(str);
        }
        else if(x==4)
        {
            schedule();
        }
    }
    else if(str.substr(0,1)=="T") ///teacher
    {



        /// view details , change pass, view the courses he takes
        cout<<"Choose one of the following options :"<<endl;

    }
    else if(str.substr(0,1)=="A") ///administrator
    {
        /// enter new student info, edit student info , marks entry

        cout<<"Choose one of the following options :"<<endl;
        cout<<" 1. Enter New Student Details "<<endl;
        cout<<" 2. Edit Student Grade "<<endl;   /// semester-wise
//        cout<<" 3. Edit Student Info "<<endl;
//        cout<<" 4.  "<<endl<<endl;

        cout<<"Enter your choice : ";
        cin>>x;

        if(x==1)
        {
            setStudent();
        }
        else if(x==2)
        {
            edit_marks(str);
        }

    }
}



int main()
{

//    Student s1("190041204","Aashnan Rahman","25/09/2000","Male","A +ve","01679115254");
//    Student s2("190041238","Syem Aziz","19/12/2001","Male","O +ve","01979289175");
//    Student s3("190041240","Moudud Hasan","14/10/2001","Male","O +ve","01515669457");
    authorization();
    Student s4;
    s4.setStudent();

    //Student s4;
    //s4.setStudent();
//    s1.showStudent();
//    s2.showStudent();
//    s3.showStudent();
//    s4.showStudent();
    //s4.showStudent();
    //  showAll();
    return 0;
}
