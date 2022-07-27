#include<bits/stdc++.h>
//add vaccine status
using namespace std;

void access()
{
    string str ;
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

        }
        else if(x==2)
        {

        }
        else if(x==3)
        {

        }
        else if(x==4)
        {

        }
    }
    else if(str.substr(0,1)=='T') ///teacher
    {
        /// view details , change pass, view the courses he takes
        cout<<"Choose one of the following options :"<<endl;

    }
    else if(str.substr(0,1)=='A') ///administrator
    {
        /// enter new student info, edit student info , marks entry
        cout<<"Choose one of the following options :"<<endl;
    }
}

int main()
{

}
