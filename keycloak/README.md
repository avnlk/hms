# Keycloak Configuration

## Importing the Realm

Import `realm-export.json` into your Keycloak instance via the Admin Console
(**Realm Settings → Import**) or using the Keycloak CLI/API.

## Setting the Admin Password

The realm export intentionally does not contain any credentials.
After importing the realm you **must** set a password for the admin user
through the Keycloak Admin Console:

1. Log in to the Keycloak Admin Console.
2. Switch to the **hostel** realm.
3. Navigate to **Users** and select `admin@iiitb.ac.in`.
4. Open the **Credentials** tab and click **Set password**.
5. Enter a strong password and disable the *Temporary* toggle.

Never commit passwords or credentials to source control.
