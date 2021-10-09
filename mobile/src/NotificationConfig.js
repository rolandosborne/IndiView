const INDIVIEW_SERVER: string = "https://indiview.coredb.org/app/"

let token: string;
export function setToken(data) {
  token = data;
}

let config: string;
export function setConfig(data, channel) {
  fetch(INDIVIEW_SERVER + "account/notifications?token=" + encodeURIComponent(token), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: data, channel: 'apn' }) }).then(response => {
    console.log(response);
    console.log(response.status);
  }).catch(err => {
    console.log(err);
  });
}



