import { json } from "@remix-run/node"
import { useEffect } from "react"
import {
  Form,
  Links,
  LiveReload,
  Meta,
  Outlet,
  NavLink,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react"
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node"
import { getContacts, createEmptyContact } from "./data"

import appStylesHref from "./app.css"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const q = url.searchParams.get("q")
  const contacts = await getContacts(q)
  return json({ contacts, q })
}

export const action = async () => {
  const contact = await createEmptyContact()
  return json({ contact })
}

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const submit = useSubmit()

  useEffect(() => {
    const searchField = document.getElementById("q")
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || ""
    }
  }, [q])

  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q")

  function mySubmit(event: React.FormEvent<HTMLFormElement>) {
    const isFirstSearch = q === null
    submit(event.currentTarget, {
      replace: !isFirstSearch,
    })
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div
          className={navigation.state === "loading" ? "loading" : ""}
          id="sidebar"
        >
          <h1>Remix Contacts</h1>

          <div>
            <Form id="search-form" role="search" onChange={mySubmit}>
              <input
                id="q"
                aria-label="Search contacts"
                defaultValue={q || ""}
                placeholder="Search"
                type="search"
                name="q"
                className={searching ? "loading" : ""}
              />

              <div id="search-spinner" aria-hidden hidden={!searching} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>

          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? "active" : isPending ? "pending" : ""
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? <span>★</span> : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>

        <div id="detail">
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
