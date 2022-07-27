//v 0.1
#include<bits/stdc++.h>
#include <ctime>
using namespace std;

time_t ttime = time(0);
tm *local_time = localtime(&ttime);

class Student
{
    private:
    string studentID;
    string name;
    string batch;
    string dept;
    string program;
    string section;
    int semester;
    string dateOfBirth;
    int age;
    string gender;
    //string residence;
    string BloodGroup;
    //double CG;
    string contact_no;
    void department()
    {
        string x = studentID.substr(4,2);
        if(x=="11")
        {
            dept = "Mechanical";
            program = "Mechanical";
        }
        else if(x=="12")
        {
            dept = "Mechanical";
            program = "IPE";
        }
        else if(x=="21")
        {
            dept = "EEE";
            program = "EEE";
        }
        else if(x=="41")
        {
            dept = "CSE";
            program = "CSE";
        }
        else if(x=="42")
        {
            dept = "CSE";
            program = "SWE";
        }
        else if(x=="51")
        {
            dept = "CEE";
            program = "CEE";
        }
        else if(x=="61")
        {
            dept = "BTM";
            program = "BTM";
        }


    }
    void ageAndSem()
    {
        string y = dateOfBirth.substr(6,4);
        string m = dateOfBirth.substr(3,2);
        string d = dateOfBirth.substr(0,2);
        string a = m + d;

        long long t1 = (y[0]-'0')*1000 + (y[1]-'0')*100 + (y[2]-'0')*10 + (y[3]-'0');
        long long t2 = 1900 + local_time->tm_year;
        long long t3 = (a[0]-'0')*1000 + (a[1]-'0')*100 + (a[2]-'0')*10 + (a[3]-'0') ;
        long long t4 = (1 + local_time->tm_mon)*100 + (local_time->tm_mday) ;
        age = t2-t1;
        if( t4 < t3 ) age--;

        long long t5 = (batch[0]-'0')*10 +(batch[1]-'0');
        long long monthspassed =  (local_time->tm_year - 100 - t5 - 1)*12 + 1 + local_time->tm_mon;
        semester = ceil((double)monthspassed/6.00);
        if( (1 + local_time->tm_mon) < 9 ) semester--;
    }
    void details()
    {
        batch = studentID.substr(0,2);
        department();
        section = studentID.substr(6,1);
    }

    public:
    Student(string a,string b,string c,string d,string e,string f):studentID(a),name(b),dateOfBirth(c),gender(d),BloodGroup(e),contact_no(f)
    {
        if(a.size()>9) studentID="";
        details();
        ageAndSem();
    }
    Student(){}
    void setStudent()
    {
        cout<<endl<<"Please Enter Student Details: "<<endl;
        cout<<"Student ID     : ";
        cin>>studentID;
        cout<<"Student Name   : ";
        getchar();
        getline(cin,name);
        //getchar();
        cout<<"Date of Birth  : ";
        cin>>dateOfBirth;
        cout<<"Gender         : ";
        cin>>gender;
        cout<<"Blood Group    : ";
        cin>>BloodGroup;
        cout<<"Contact No.    : ";
        cin>>contact_no;
        cout<<endl;
        details();
        ageAndSem();
    }
    void showStudent()
    {
        cout<<endl<<endl<<"Student Details"<<endl;
        cout<<"Student ID     : "<<studentID<<endl;
        cout<<"Student Name   : "<<name<<endl;
        cout<<"Batch          : "<<batch<<endl;
        cout<<"Semester       : "<<semester<<endl;
        cout<<"Department     : "<<dept<<endl;
        cout<<"Program        : "<<program<<endl;
        cout<<"Section        : "<<section<<endl;
        cout<<"Date of Birth  : "<<dateOfBirth<<endl;
        cout<<"Age            : "<<age<<endl;
        cout<<"Gender         : "<<gender<<endl;
        cout<<"Blood Group    : "<<BloodGroup<<endl;
        cout<<"Contact No.    : "<<contact_no<<endl;
        //cout<<"CG           : "<<CG<<endl;
        //cout<<"Residence    : "<<residence<<endl;

    }
};

class Course
{
private:
    int semester;
    string courseName;
    string courseCode;
    string courseType;
    int classesTaken=0;
    double credit;
    int evaluationsTaken = 0;
    string TeacherID;
    int classesPerWeek;
    //handle evaluations, reduce class if needed
    void classcount()
    {

    }

public:
    Course(int a,string b,string c,string d,double e,string f,int g):semester(a),courseName(b),courseCode(c),courseType(d),credit(e),TeacherID(f),classesPerWeek(g)
    {

    }
    void getCourse()
    {
        cout<<endl<<endl<<"Course Details"<<endl;
        cout<<"Semester       : ";
        cin>>semester;
        cout<<"Course Code    : ";
        cin>>courseCode;
        cout<<"Course Name    : ";
        cin>>courseName;
        cout<<"Course Type    : ";
        cin>>courseName;
        cout<<"Course Credit  : ";
        cin>>credit;
        cout<<"Teacher ID     : ";
        cin>>TeacherID;
        cout<<"Classes/Week   : ";
        cin>>classesPerWeek;
    }
    void ChangeClassCount(int x = 1)
    {
        classesTaken-=x;
    }
    void AddEvaluationsTaken(int x = 1)
    {
        evaluationsTaken+=x;
    }
    void TotalClasses()
    {
        //Under construction
    }
    void showCourse()
    {
        cout<<endl<<endl<<"Course Details"<<endl;
        cout<<"Course Code    : "<<courseCode<<endl;
        cout<<"Course Name    : "<<courseName<<endl;
        cout<<"Course Type    : "<<courseType<<endl;
        cout<<"Course Credit  : "<<credit<<endl;
        cout<<"Teacher ID     : "<<TeacherID<<endl;
        cout<<"Classes/Week   : "<<classesPerWeek<<endl;
        cout<<"Classes Taken  : "<<classesTaken<<endl;//
        cout<<"Evaluations    : "<<evaluationsTaken<<endl;//
    }

};

class Teacher
{
private:
    string TeacherID;
    string name;
    string shortName;
    string dept;
    string post;
    string dateOfBirth;
    int age;
    string gender;
    string contactNo;

    void details()
    {
        if(TeacherID[0]=='4') dept = "Computer Science and Engineering(CSE)";
        if(TeacherID[0]=='2') dept = "Electrical and Electronic Engineering(EEE)";
        if(TeacherID[0]=='1') dept = "Mechanical and Production Engineering(MPE)";
        if(TeacherID[0]=='5') dept = "Civil and Environmental Engineering(CEE)";
        if(TeacherID[0]=='6') dept = "Business and Technology Management(BTM)";

        string y = dateOfBirth.substr(6,4);
        string m = dateOfBirth.substr(3,2);
        string d = dateOfBirth.substr(0,2);
        string a = m + d;

        long long t1 = (y[0]-'0')*1000 + (y[1]-'0')*100 + (y[2]-'0')*10 + (y[3]-'0');
        long long t2 = 1900 + local_time->tm_year;
        long long t3 = (a[0]-'0')*1000 + (a[1]-'0')*100 + (a[2]-'0')*10 + (a[3]-'0') ;
        long long t4 = (1 + local_time->tm_mon)*100 + (local_time->tm_mday) ;
        age = t2-t1;
        if( t4 < t3 ) age--;

    }

    public:
    Teacher(string a,string b,string c,string g,string d,string e,string f):TeacherID(a),name(b),shortName(c),post(g),dateOfBirth(d),gender(e),contactNo(f)
    {
        details();
    }
    Teacher(){}
    void setTeacher()
    {
        cout<<endl<<"Please Enter Teacher Details: "<<endl;
        cout<<"Teacher ID     : ";
        cin>>TeacherID;
        cout<<"Teacher Name   : ";
        getchar();
        getline(cin,name);
        cout<<"Teacher Short-name   : ";
        cin>>shortName;
        cout<<"Post           : ";
        cin>>post;
        cout<<"Date of Birth  : ";
        cin>>dateOfBirth;
        cout<<"Gender         : ";
        cin>>gender;
        cout<<"Contact No.    : ";
        cin>>contactNo;
        cout<<endl;
        details();
    }
    void showTeacher()
    {
        cout<<endl<<endl<<"Teacher Details"<<endl;
        cout<<"Teacher ID     : "<<TeacherID<<endl;
        cout<<"Student Name   : "<<name<<" ( "<<shortName<<" )"<<endl;
        cout<<"Department     : "<<dept<<endl;
        cout<<"Post           : "<<post<<endl;
        cout<<"Date of Birth  : "<<dateOfBirth<<endl;
        cout<<"Age            : "<<age<<endl;
        cout<<"Gender         : "<<gender<<endl;
        cout<<"Contact No.    : "<<contactNo<<endl;

    }
};

void database()
{
    Student s1("190041204","Aashnan Rahman","25/09/2000","Male","A +ve","01679115254");
    Student s2("190041238","Syem Aziz","19/12/2001","Male","O +ve","01979289175");
    Student s3("190041240","Moudud Hasan","14/10/2001","Male","O +ve","01515669457");
    //Student s4;
    //s4.setStudent();
    s1.showStudent();
    s2.showStudent();
    s3.showStudent();
    //s4.showStudent();

    Course c1(3,"Linear Algebra","MATH 4341","Theory",3.00,"MKS",2);
    Course c2(3,"Electronic Devices and Circuits","EEE 4383","Theory",3.00,"RAM",2);
    Course c3(3,"Object Oriented Programming","CSE 4301","Theory",3.00,"FH",2);
    Course c4(3,"Data Structures","CSE 4303","Theory",3.00,"SA",2);
    Course c5(3,"Computer Organization and Architecture","CSE 4305","Theory",3.00,"MHA",2);
    Course c6(3,"Database Management Systems","CSE 4307","Theory",3.00,"ARMK",2);
    Course c7(3,"Electronic Devices and Circuits Lab","EEE 4384","Lab",1.50,"RAM",2);
    Course c8(3,"Object Oriented Programming Lab","CSE 4302","lab",3.00,"FH",2);
    Course c9(3,"Data Structures Lab","CSE 4304","Theory",3.00,"SA",2);
    Course c10(3,"Database Management Systems Lab","CSE 4308","Lab",2.00,"ARMK",2);

    c1.showCourse();
    c2.showCourse();
    c3.showCourse();
    c4.showCourse();
    c5.showCourse();
    c6.showCourse();
    c7.showCourse();
    c8.showCourse();
    c9.showCourse();
    c10.showCourse();

    Teacher t1("1101","Sabbir Ahmed","SA","Lecturer","01/01/1995","Male","0111111111");

    t1.showTeacher();
}


int main()
{
    database();
}
