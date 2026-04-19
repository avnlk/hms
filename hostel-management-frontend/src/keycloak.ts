import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8180",
  realm: "hostel",
  clientId: "hostel-frontend"
});

export default keycloak;
