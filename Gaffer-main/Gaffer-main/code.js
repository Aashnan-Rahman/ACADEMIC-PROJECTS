#include<bits/stdc++.h>
#define FRU freopen("out.txt","w",stdout)
#define FRO freopen("in.txt","r",stdin)
#define pb push_back
#define mp make_pair
#define ff first
#define ss second
#define mem(ara,n) memset(ara,n,sizeof ara)
#define loop(i,j,n) for(i=j;i<n;i++)
#define rloop(i,j,n) for(i=n;i>=j;i--)
#define INF 2147483647
#define ll long long
#define pii pair<int,int>
#define eps 1e-9
#define mii map<int,int>
#define vi vector<int>
#define all(n) n.begin(),n.end()
#define inf INF
#define INFLL 9223372036854775807
using namespace std;
int dp[200005][2];



int main()
{
    int n,m,cnt=0,i,j,k,tc,t,a;
    int ara[200005];
    vi v;
    cin>>n>>k;
    ara[0]=1;
    for(i=1;i<=n;i++)
    {
        cin>>a;
        if(a<0)ara[i]=-1;
        else ara[i]=1;
    }
    cnt=1;
    int flag=1;
    for(i=1;i<=n;i++)
    {
        if(ara[i]==ara[i-1])cnt++;
        else
        {
            if(!flag)v.pb(cnt);
            flag=0;
            cnt=1;
        }
    }
    if(cnt)v.pb(cnt);
    for(i=0;i<v.size();i++)cout<<v[i]<<endl;

}
#include<bits/stdc++.h>
#define FRU freopen("out.txt","w",stdout)
#define FRO freopen("in.txt","r",stdin)
#define pb push_back
#define mp make_pair
#define ff first
#define ss second
#define mem(ara,n) memset(ara,n,sizeof ara)
#define loop(i,j,n) for(i=j;i<n;i++)
#define rloop(i,j,n) for(i=n;i>=j;i--)
#define INF 2147483647
#define ll long long
#define pii pair<int,int>
#define eps 1e-9
#define mii map<int,int>
#define vi vector<int>
#define all(n) n.begin(),n.end()
#define inf INF
#define INFLL 10000000000000000LL
using namespace std;
int ara[200005],ara1[200005],ara2[200005];
int main()
{
    int n,m,cnt=0,cnt1=0;
    int tc,t,i,j,k,a,b;

    cin>>tc;
    while(tc--)
    {
        cin>>n;
        for(i=0; i<n; i++)
        {
            scanf("%d",&ara[i]);
        }
        if(n%2==0)
        {
            int ff=1,ff1=1;
            ara[n]=ara[0];
            for(i=1; i<=n; i++)
            {
                if(ara[i]==ara[i-1])
                    ff=0;
                if(ara[i]!=ara[i-1])
                    ff1=0;
            }
            if(ff1)
            {
                cout<<1<<endl;
                for(i=0; i<n; i++)
                    printf("1 ");
                printf("\n");
            }
            else {
            cout<<2<<endl;
            for(i=0; i<n; i++)
            {
                cout<<(i%2?1:2)<<" ";
            }
            cout<<endl;
            }
        }
        else
        {
            int Max=0;
            int ff=1,ff1=1;
            ara[n]=ara[0];
            for(i=1; i<=n; i++)
            {
                if(ara[i]==ara[i-1])
                    ff=0;
                if(ara[i]!=ara[i-1])
                    ff1=0;
            }
            if(ff)
            {
                cout<<3<<endl;
                for(i=0; i<n; i++)
                {
                    if(i==n-1)
                        cout<<3<<endl;
                    else
                    {
                        cout<<(i%2?1:2)<<" ";
                    }
                }
            }
            else if(ff1)
            {
                cout<<1<<endl;
                for(i=0; i<n; i++)
                    printf("1 ");
                printf("\n");
            }
            else
            {
                cout<<2<<endl;
                ara1[i]=0;
                int flg=0;
                for(i=1; i<n; i++)
                {
                    if(ara[i]==ara[i-1]&& !flg)
                    {
                        ara1[i]=ara1[i-1];
                        flg=1;
                    }
                    else
                        ara1[i]=1-ara1[i-1];
                }
                for(i=0; i<n; i++)printf("%d ",ara1[i]+1);printf("\n");
            }
        }
    }

}
#include<bits/stdc++.h>
#define FRU freopen("out.txt","w",stdout)
#define FRO freopen("in.txt","r",stdin)
#define pb push_back
#define mp make_pair
#define ff first
#define ss second
#define mem(ara,n) memset(ara,n,sizeof ara)
#define loop(i,j,n) for(i=j;i<n;i++)
#define rloop(i,j,n) for(i=n;i>=j;i--)
#define INF 2147483647
#define ll long long
#define pii pair<int,int>
#define eps 1e-9
#define mii map<int,int>
#define vi vector<int>
#define all(n) n.begin(),n.end()
#define inf INF
#define INFLL 9223372036854775807
using namespace std;
int main()
{
    int n,m,cnt=0,i,j,k,tc,t;
    int ara[200005];
    cin>>tc;
    while(tc--)
    {
        cin>>n;
        for(i=0;i<n;i++)cin>>ara[i];
        sort(ara,ara+n);
        int ans=0;
        cnt=0;
        for(i=0,j=n-1;i<n,j>=0,i<=j;i++,j--)
        {
            if(i==j)break;
            if(ara[i]==ara[j])break;
        }
        if(i==j)ans=1;
        if(i<j&& ara[i]==ara[j])
        {
            int unused=j-i+1;
            j=i+1;
            for(;i>=0;i--)
            {
                if(ara[i]!=ara[j])break;
                cnt++;
            }
            for(i=j;i<n;i++)
            {
                if(ara[i]!=ara[j])break;
                cnt++;
            }
            int used=cnt-unused;
            int x=n-(used*2)-unused;
            //cout<<cnt<<" "<<used<<" "<<x<<endl;
            if(unused>x)ans=unused-x;
            else if(unused%2!=0)ans=1;
        }
        cout<<ans<<endl;
    }

}
