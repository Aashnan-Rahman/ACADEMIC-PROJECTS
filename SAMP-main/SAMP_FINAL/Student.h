#ifndef STUDENT_H
#define STUDENT_H
#include<string>
using namespace std;

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
public:
    void department();
    void ageAndSem();
    void details();
    Student(string a,string b,string c,string d,string e,string f);
    Student();
    void showStudent();
    void setStudent();
    void authorization();
    void edit_marks(string id);
    void edit_password(string id);
    void accessDetails(string id);
    void check_pass(string id,string pass);
};



#endif // STUDENT_H
