#include<bits/stdc++.h>
#include "Student.h"
#include <ctime>

string access_ID,access_pass;

using namespace std;

enum user {administrator,student,teacher};

time_t ttime = time(0);
tm *local_time = localtime(&ttime);
void dis(int x = 1)
{
    for(int i=0; i<40; i++)
    {
        if(x==1) cout<<"-";
        else cout<<"*";
    }
    cout<<endl;
}



namespace shomoy
{
string routine_slot[15]= {"080000","090000","100000","110000","120000","125000","141000","151000","161500","170500","180500"};

int c_year = 1900 + local_time->tm_year;
int c_month = 1 + local_time->tm_mon;
int c_date = local_time->tm_mday;
int c_day = local_time->tm_wday;
int c_hour = local_time->tm_hour;
int c_min = local_time->tm_min;
int c_sec = local_time->tm_sec;

//    int c_hour=9;
//    int c_min=45;
//    int c_sec=22;

//    int tx = c_sec + c_min*100 + c_hour*10000;
//    string curr_time = to_string(tx);
int tx = c_sec + c_min*100 + c_hour*10000;
string tmp_time = to_string(tx);
int n=6-tmp_time.length();
string xx(n,'0');
string curr_time=xx+tmp_time;
}

using namespace shomoy;


string access_ID,access_pass;

void Student::department()
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

string course_id[] = {"CSE__4105","CSE__4101","MATH_4141","HUM__4145","HUM__4147","PHY__4141","HUM__4142","PHY__4142","CSE__4108","CSE__4104",
                      "CSE__4203","CSE__4205","CHEM_4241","HUM__4241","MATH_4241","PHY__4241","HUM__4242","PHY__4242","CHEM_4242","CSE__4204","CSE__4206",
                      "CSE__4301","CSE__4303","CSE__4305","CSE__4307","MATH_4341","EEE__4383","EEE__4384","CSE__4302","CSE__4304","CSE__4308",
                      "CSE__4403","CSE__4405","CSE__4407","EEE__4483","HUM__4441","MATH_4441","EEE__4484","CSE__4402","CSE__4404","CSE__4408"
                     };

string course_credit[] =
{
    "Computing_for_Engineers","Structured_Programming_I","Geometry_and_Differential_Calculus","Islamiat","Technology,_Environment_and_Society","Physics_I","Arabic_I","Physics_I_Lab","Structured_Programming_I_Lab","Engineering_Drawing_Lab",
    "Discrete_Mathematics"," Digital_Logic_Design","Chemistry","Islamic_History_Science_and_Culture","Integral_Calculus_and_Differential_Equations","Physics_II","Arabic_II","Physics_II_Lab","Chemistry_Lab","Structured_Programming_II_Lab","Digital_Logic_Design_Lab",
    "Object_Oriented_Programming","Data_Structures","Computer_Organization_and_Architecture","Database_Management_Systems","Linear_Algebra","Electronic_Devices_and_Circuits","Electronic_Devices_and_Circuits_Lab","Object_Oriented_Programming_Lab","Data_Structures_Lab","Database_Management_Systems_Lab",
    "Algorithms","Data_and_Telecommunications","System_Analysis_and_Design","Digital_Electronics_and_Pulse_Techniques","Engineering_Ethics", "Probability_and_Statistics","Digital_Electronics_and_Pulse_Techniques_Lab","Visual_Programming_Lab","Algorithms_Lab","System_Analysis_and_Design_Lab"
};
void access();
void Student::ageAndSem()
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
void Student::details()
{
    batch = studentID.substr(0,2);
    department();
    section = studentID.substr(6,1);
}
Student::Student(string a,string b,string c,string d,string e,string f):studentID(a),name(b),dateOfBirth(c),gender(d),BloodGroup(e),contact_no(f)
{
    if(a.size()>9) studentID="";
    details();
    ageAndSem();
}

int check_id(string st_id)
{
    string id;
    int flag=0;
    ifstream all_id("All_ID.txt");
    if(all_id)
    {
        while(all_id>>id)
        {
            if(st_id==id)
            {
                flag=1;
                all_id.close();
                return 1;
            }
        }
    }
    if(flag==0)
    {
        all_id.close();
        ofstream all_id("All_ID.txt",ios::app);
        all_id<<st_id<<endl;
        all_id.close();
        return 0;
    }
}


void check_pass(string id,string pass)
{
    int flag=0;
    ifstream password("Password.txt");
    string traverse_id,traverse_pass;
    if(password)
    {
        while(password>>traverse_id>>traverse_pass)
        {
            if(id==traverse_id && pass==traverse_pass)
            {
//        cout<<"Present"<<endl;
                access();
                flag=1;
            }
        }
        if(flag==0)
        {
            cout<<"Not Found"<<endl;
        }

    }
    else
    {
        cout<<"File Not Found"<<endl;
    }
    password.close();
    system("PAUSE");
    system("CLS");
}

void make_empty_file(string st_id,string name)
{
    float f=0.0;
    ifstream student_id("student_id.txt");
//    if(check_id(st_id))
//    {
//        cout<<"Already Exists"<<st_id<<endl;
//    }
//    else
//    {
    if(student_id)
    {
        student_id.close();
        ofstream student_id("student_id.txt",ios::app);
        for(int i=0; i<41; i++)
        {
            cout<<st_id<<" "<<name<<" "<<course_id[i]<<" "<<course_credit[i]<<" "<<f<<" "<<f<<" "<<f<<" "<<f<<" "<<f<<" "<<f<<" "<<f<<endl;
            student_id<<st_id<<" "<<name<<" "<<course_id[i]<<" "<<course_credit[i]<<" "<<f<<" "<<f<<" "<<f<<" "<<f<<" "<<f<<" "<<f<<" "<<f<<endl;

        }
        student_id.close();
    }
    else
    {
        ofstream student_id("student_id.txt");
        for(int i=0; i<41; i++)
        {
            cout<<st_id<<" "<<name<<" "<<course_id[i]<<" "<<course_credit[i]<<" "<<f<<" "<<f<<" "<<f<<" "<<f<<" "<<f<<" "<<f<<" "<<f<<endl;
            student_id<<st_id<<" "<<name<<" "<<course_id[i]<<" "<<course_credit[i]<<" "<<f<<" "<<f<<" "<<f<<" "<<f<<" "<<f<<" "<<f<<" "<<f<<endl;

        }
        student_id.close();
    }
//    }
}




void authorization_setup(string st_id)
{

    ifstream password("Password.txt");
//    if(check_id(st_id))
//    {
//        cout<<"Already Exists"<<st_id<<endl;
//    }
//    else
//    {
    if(password)
    {
        password.close();
        ofstream password("Password.txt",ios::app);
        password<<st_id<<" "<<st_id<<endl;
        password.close();
    }
    else
    {
        ofstream password("Password.txt");
        password<<st_id<<" "<<st_id<<endl;
        password.close();
    }
//    }
}



Student::Student() {}
void Student::setStudent()
{
    ifstream student("student.txt");
    if(student)
    {
        student.close();
        ofstream student("student.txt",ios::app);
        cout<<endl<<"Please Enter Student Details: "<<endl;
        cout<<"Student ID     : ";
        cin>>studentID;
        if(check_id(studentID))
        {
            cout<<"Already Exists 1"<<endl;
        }
        else
        {
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
            student<<studentID<<" "<<name<<" "<<batch<<" "<<semester<<" "<<dept<<" "<<program<<" "<<section<<" "<<dateOfBirth<<" "<<age<<" "<<gender<<" "<<BloodGroup<<" "<<contact_no<<endl;
            cout<<endl;
            make_empty_file(studentID,name);
            authorization_setup(studentID);
            student.close();
        }
    }
    if(!student)
    {
        student.close();
        ofstream student("student.txt");
        student<<"Student_ID   Name  Date of Birth    Gender   Blood_Group    Mobile_Number"<<endl;
        cout<<endl<<"Please Enter Student Details: "<<endl;
        cout<<"Student ID     : ";
        cin>>studentID;
        if(check_id(studentID))
        {
            cout<<"Already Exists 2"<<endl;
        }
        else
        {
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
            student<<studentID<<" "<<name<<" "<<batch<<" "<<semester<<" "<<dept<<" "<<program<<" "<<section<<" "<<dateOfBirth<<" "<<age<<" "<<gender<<" "<<BloodGroup<<" "<<contact_no<<endl;
            cout<<endl;
            make_empty_file(studentID,name);
            authorization_setup(studentID);
            student.close();

        }
    }
}
void Student::showStudent()
{
    ifstream student("student.txt");
    if(!student)
    {
        cout<<"Student File not Found"<<endl;
        exit(1);
    }
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

void accessDetails(string id)
{   string studentID,name,batch,semester,dept,program,section,dateOfBirth,age,gender,BloodGroup,contact_no;
    ifstream student("student.txt");
    if(student)
    {
        while(student>>studentID>>name>>batch>>semester>>dept>>program>>section>>dateOfBirth>>age>>gender>>BloodGroup>>contact_no)
        {
            if(id==studentID)
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
            }
        }
    }
    else
    {
        cout<<"Error Opening Student File"<<endl;
    }
}

void edit_password(string st_id)
{
    int flag=0;
    ofstream passTempFile("PassTemp.txt");
    string id,pass,replaced_pass,traverse,oldpass;
    ifstream password("Password.txt");
    if(check_id(st_id))
    {
        cout<<"Enter Old Password: "<<endl;
        cin>>oldpass;
        cout<<"Enter The Password You want : ";
        cin>>replaced_pass;
        while(password>>id>>pass)
        {
            if(pass==oldpass)
            {
                pass=replaced_pass;
                flag=1;
            }
            if(1)
            {
                passTempFile<<id<<" "<<pass<<endl;
            }
        }
        if(!flag)
        {
            cout<<"Wrong Password"<<endl;
        }
        password.close();
        passTempFile.close();
        ofstream password("Password.txt");
        ifstream passTempFile("PassTemp.txt");
        if(passTempFile)
        {
            while(passTempFile>>id>>pass)
            {
                password<<id<<" "<<pass<<endl;
            }
        }
        password.close();
        passTempFile.close();
        remove("PassTemp.txt");


    }
    else
    {
        cout<<"ID not Found"<<endl;
    }

}

void authorization()
{

    cout<<"Welcome to STUDENT'S ACADEMIC MANAGEMENT PROJECT (SAMP) "<<endl<<endl<<endl;

    // dis(3);
    cout<<endl<<endl<<endl;



    cout<< "Enter ID       : ";
    cin>>access_ID;

    cout<<endl<< "Enter Password : ";
    cin>>access_pass;

    cout<<endl;

    check_pass(access_ID,access_pass);

    system("PAUSE");
    system("CLS");

}



void edit_marks(string st_id)
{
    ofstream tempFile("temp.txt");
    string id,name,course_id,course_credit,course_name;
    string att,q1,q2,q3,q4,mid,sem_fin,marks;
    ifstream course_file("student_id.txt");
    if(!course_file)
    {
        cout<<"Course File not Found"<<endl;
    }
    else
    {
        int option;
        string strin,str,str_id,str_course;
        cout<<"Enter Course Code : ";
        cin>>course_name;
        cout<<"What do You Want to Update ?"<<endl;
        cout<<"1.Attendance"<<endl;
        cout<<"2.Quiz 1"<<endl;
        cout<<"3.Quiz 2"<<endl;
        cout<<"4.Quiz 3"<<endl;
        cout<<"5.Quiz 4"<<endl;
        cout<<"6.Mid Semester Exam"<<endl;
        cout<<"7.Semester Final Exam"<<endl;
        cin>>option;
        cout<<"Enter updated marks: ";
        cin>>marks;
        switch(option)
        {
        case 1:
        {

            while(course_file>>str_id>>name>>str_course>>course_credit>>att>>q1>>q2>>q3>>q4>>mid>>sem_fin)
            {
                if(str_id==st_id && str_course==course_name)
                {
                    att=marks;
                }
                if(1)
                {
                    tempFile<<str_id<<" "<<name<<" "<<str_course<<" "<<course_credit<<" "<<att<<" "<<q1<<" "<<q2<<" "<<q3<<" "<<q4<<" "<<mid<<" "<<sem_fin<<endl;
                }
            }
            course_file.close();
            tempFile.close();
            ofstream course_file("student_id.txt");
            ifstream tempFile("temp.txt");
            if(tempFile)
            {
                while(tempFile>>str_id>>name>>str_course>>course_credit>>att>>q1>>q2>>q3>>q4>>mid>>sem_fin)
                {
                    course_file<<str_id<<" "<<name<<" "<<str_course<<" "<<course_credit<<" "<<att<<" "<<q1<<" "<<q2<<" "<<q3<<" "<<q4<<" "<<mid<<" "<<sem_fin<<endl;
                }
            }
            course_file.close();
            tempFile.close();
            remove("temp.txt");
            system("pause");
            break;
        }
        case 2:
        {
            while(course_file>>str_id>>name>>str_course>>course_credit>>att>>q1>>q2>>q3>>q4>>mid>>sem_fin)
            {
                if(str_id==st_id && str_course==course_name)
                {
                    q1=marks;
                }
                if(1)
                {
                    tempFile<<str_id<<" "<<name<<" "<<str_course<<" "<<course_credit<<" "<<att<<" "<<q1<<" "<<q2<<" "<<q3<<" "<<q4<<" "<<mid<<" "<<sem_fin<<endl;
                }
            }
            course_file.close();
            tempFile.close();
            ofstream course_file("student_id.txt");
            ifstream tempFile("temp.txt");
            if(tempFile)
            {
                while(tempFile>>str_id>>name>>str_course>>course_credit>>att>>q1>>q2>>q3>>q4>>mid>>sem_fin)
                {
                    course_file<<str_id<<" "<<name<<" "<<str_course<<" "<<course_credit<<" "<<att<<" "<<q1<<" "<<q2<<" "<<q3<<" "<<q4<<" "<<mid<<" "<<sem_fin<<endl;
                }
            }
            course_file.close();
            tempFile.close();
            remove("temp.txt");
            system("pause");
            break;
        }
        case 3:
        {
            while(course_file>>str_id>>name>>str_course>>course_credit>>att>>q1>>q2>>q3>>q4>>mid>>sem_fin)
            {
                if(str_id==st_id && str_course==course_name)
                {
                    q2=marks;
                }
                if(1)
                {
                    tempFile<<str_id<<" "<<name<<" "<<str_course<<" "<<course_credit<<" "<<att<<" "<<q1<<" "<<q2<<" "<<q3<<" "<<q4<<" "<<mid<<" "<<sem_fin<<endl;
                }
            }
            course_file.close();
            tempFile.close();
            ofstream course_file("student_id.txt");
            ifstream tempFile("temp.txt");
            if(tempFile)
            {
                while(tempFile>>str_id>>name>>str_course>>course_credit>>att>>q1>>q2>>q3>>q4>>mid>>sem_fin)
                {
                    course_file<<str_id<<" "<<name<<" "<<str_course<<" "<<course_credit<<" "<<att<<" "<<q1<<" "<<q2<<" "<<q3<<" "<<q4<<" "<<mid<<" "<<sem_fin<<endl;
                }
            }
            course_file.close();
            tempFile.close();
            remove("temp.txt");
            system("pause");
            break;
        }
        case 4:
        {
            while(course_file>>str_id>>name>>str_course>>course_credit>>att>>q1>>q2>>q3>>q4>>mid>>sem_fin)
            {
                if(str_id==st_id && str_course==course_name)
                {
                    q3=marks;
                }
                if(1)
                {
                    tempFile<<str_id<<" "<<name<<" "<<str_course<<" "<<course_credit<<" "<<att<<" "<<q1<<" "<<q2<<" "<<q3<<" "<<q4<<" "<<mid<<" "<<sem_fin<<endl;
                }
            }
            course_file.close();
            tempFile.close();
            ofstream course_file("student_id.txt");
            ifstream tempFile("temp.txt");
            if(tempFile)
            {
                while(tempFile>>str_id>>name>>str_course>>course_credit>>att>>q1>>q2>>q3>>q4>>mid>>sem_fin)
                {
                    course_file<<str_id<<" "<<name<<" "<<str_course<<" "<<course_credit<<" "<<att<<" "<<q1<<" "<<q2<<" "<<q3<<" "<<q4<<" "<<mid<<" "<<sem_fin<<endl;
                }
            }
            course_file.close();
            tempFile.close();
            remove("temp.txt");
            system("pause");
            break;
        }
        case 5:
        {
            while(course_file>>str_id>>name>>str_course>>course_credit>>att>>q1>>q2>>q3>>q4>>mid>>sem_fin)
            {
                if(str_id==st_id && str_course==course_name)
                {
                    q4=marks;
                }
                if(1)
                {
                    tempFile<<str_id<<" "<<name<<" "<<str_course<<" "<<course_credit<<" "<<att<<" "<<q1<<" "<<q2<<" "<<q3<<" "<<q4<<" "<<mid<<" "<<sem_fin<<endl;
                }
            }
            course_file.close();
            tempFile.close();
            ofstream course_file("student_id.txt");
            ifstream tempFile("temp.txt");
            if(tempFile)
            {
                while(tempFile>>str_id>>name>>str_course>>course_credit>>att>>q1>>q2>>q3>>q4>>mid>>sem_fin)
                {
                    course_file<<str_id<<" "<<name<<" "<<str_course<<" "<<course_credit<<" "<<att<<" "<<q1<<" "<<q2<<" "<<q3<<" "<<q4<<" "<<mid<<" "<<sem_fin<<endl;
                }
            }
            course_file.close();
            tempFile.close();
            remove("temp.txt");
            system("pause");
            break;
        }
        case 6:
        {
            while(course_file>>str_id>>name>>str_course>>course_credit>>att>>q1>>q2>>q3>>q4>>mid>>sem_fin)
            {
                if(str_id==st_id && str_course==course_name)
                {
                    mid=marks;
                }
                if(1)
                {
                    tempFile<<str_id<<" "<<name<<" "<<str_course<<" "<<course_credit<<" "<<att<<" "<<q1<<" "<<q2<<" "<<q3<<" "<<q4<<" "<<mid<<" "<<sem_fin<<endl;
                }
            }
            course_file.close();
            tempFile.close();
            ofstream course_file("student_id.txt");
            ifstream tempFile("temp.txt");
            if(tempFile)
            {
                while(tempFile>>str_id>>name>>str_course>>course_credit>>att>>q1>>q2>>q3>>q4>>mid>>sem_fin)
                {
                    course_file<<str_id<<" "<<name<<" "<<str_course<<" "<<course_credit<<" "<<att<<" "<<q1<<" "<<q2<<" "<<q3<<" "<<q4<<" "<<mid<<" "<<sem_fin<<endl;
                }
            }
            course_file.close();
            tempFile.close();
            remove("temp.txt");
            system("pause");
            break;
        }
        case 7:
        {
            while(course_file>>str_id>>name>>str_course>>course_credit>>att>>q1>>q2>>q3>>q4>>mid>>sem_fin)
            {
                if(str_id==st_id && str_course==course_name)
                {
                    sem_fin=marks;
                }
                if(1)
                {
                    tempFile<<str_id<<" "<<name<<" "<<str_course<<" "<<course_credit<<" "<<att<<" "<<q1<<" "<<q2<<" "<<q3<<" "<<q4<<" "<<mid<<" "<<sem_fin<<endl;
                }
            }
            course_file.close();
            tempFile.close();
            ofstream course_file("student_id.txt");
            ifstream tempFile("temp.txt");
            if(tempFile)
            {
                while(tempFile>>str_id>>name>>str_course>>course_credit>>att>>q1>>q2>>q3>>q4>>mid>>sem_fin)
                {
                    course_file<<str_id<<" "<<name<<" "<<str_course<<" "<<course_credit<<" "<<att<<" "<<q1<<" "<<q2<<" "<<q3<<" "<<q4<<" "<<mid<<" "<<sem_fin<<endl;
                }
            }
            course_file.close();
            tempFile.close();
            remove("temp.txt");
            system("pause");
            break;
        }
        default:
        {
            cout<<"Error.\n";
        }
        }
    }
}


void schedule()
{
    int wday;
    string ID,sem,id,slots[15],input;
    cout<<"Enter ID : ";
    cin>>ID;
    cout<<"Enter semester : ";
    cin>>sem;
    ID = sem+ID.substr(4,3);
    ifstream routine("routine.txt");
    if(!routine)
    {
        cout<<"Routine File not Found"<<endl;
    }
    else
    {
        string strin,str,str_replace,new_str;
        /// 1412 1 CSE__4103 x x MATH_4141 CSE__4105 LUNCH_BREAK CSE__4104 CSE__4104 x x
        while(routine>>id>>wday>>slots[0]>>slots[1]>>slots[2]>>slots[3]>>slots[4]>>slots[5]>>slots[6]>>slots[7]>>slots[8]>>slots[9])
        {
            if(ID==id && c_day == wday)
            {
                for(int j=1; j<=10; j++)
                {
                    if(curr_time>=routine_slot[j-1] && curr_time<=routine_slot[j])
                    {
                        cout<<"Ongoing Class : "<<slots[j-1]<<endl;
                        cout<<"Remaining Classes : "<<endl;
                        for(int i=j; i<=9; i++)
                        {
                            if(slots[i]=="x")
                            {
                                cout<<"No Class"<<endl;
                            }
                            else
                            {
                                cout<<slots[i]<<endl;
                            }
                        }
                    }
                }

            }
        }
    }
}




