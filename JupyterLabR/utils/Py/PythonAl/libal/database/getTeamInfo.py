from .getUserToken import getUserToken
import getpass
import requests

def getTeamInfo():
    user = getpass.getuser()
    tok = getUserToken()
    url = "https://api.alphien.com/_user/api/v1.3/action/get/user/permission"
    data = {"username":user,"alsid":tok,"aluser":user}
    resp=requests.post(url,data=data)
    out = resp.json()['data']['team']
    return(out)

