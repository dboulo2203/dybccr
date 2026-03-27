# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

— a vanilla JavaScript SPA for managing inscription to workshops(inscriptions à des ateliers) for CCR. It integrates with a Dolibarr ERP backend via REST API.

## Environment

- Served locally via XAMPP Apache at `http://localhost/dyb/`
- No build system, no package manager — pure ES6 modules loaded directly by the browser
- All dependencies via CDN: Bootstrap 5.3.3, Bootstrap Icons 1.11.3, jQuery 3.7.1
- Backend API: Dolibarr at `https://kusala.fr/dolibarr/api/index.php/`
- App config lives in `src/shared/assets/configuration.json`

## Architecture

```
src/
├── shared/          # Reusable code shared across all pages
│   ├── appServices/       # App-level services (header, footer, left menu, login, init)
│   ├── appWSServices/     # Dolibarr API web service wrappers
│   ├── bootstrapServices/ # UI display modules and reusable components
│   │   └── components/    # DropdownSelector, AutocompleteSelector, field helpers
│   ├── commonServices/    # Utilities (config loader, i18n, markdown, common functions)
│   └── assets/            # configuration.json, images, locales (fr/, en/)
└── views/           # Functional pages, one folder per page
    └── pagename/    # Template page — copy this to create a new page
```

### Page structure

Each page is a self-contained folder under `src/views/` containing:

1. **`pagename.html`** — Minimal HTML shell. Loads CDN deps, defines section divs (`menuSection`, `modalSection`, `messageSection`, `mainActiveSection`, `footerDisplay`), and bootstraps the controller via `<script type="module">`.
2. **`pageNameViewController.js`** — Main controller. Entry function `startPagenameController()` calls `launchInitialisation()`, renders header/footer, checks auth, reads URL params, then delegates to block display functions.
3. action folders

- The page name has only lowercase characters.

### Initialization flow

`launchInitialisation()` (in `initialisationService.js`) runs on every page load:

1. Load configuration from JSON
2. Set theme (dark/light from sessionStorage)
3. Load translations (i18n)
4. Preload reference data (users, products, meals, civilities, etc.) into sessionStorage

### Creating a new page

- The pagename folder contains a skeleton of a page

#### page initialisation :

- Copy the entire `src/views/pagename/` folder (except action folders) and replace all occurrences of `pagename`/`Pagename` with the new page name. Pages are accessed by URL, optionally with query params (e.g. `?paramid=123`).
- the action folders are examples of an action
- a page can contains one or several blocks

### block structure

- A block is a logical entity. Its goal is to display data and manage events from the user

#### A block contains :

    - call to the web services to get the data
    - Build the HTML string to be displayed
    - Send the HTML string in the document
    - Declare event listener in relation with the block

### Reusable UI : components display fields

- use getFormattedCurrency to display currency
- use getFormattedDate to display dates
- use getStandardFieldDisplay to display standard fields
- use getStandardFieldDisplayWithLink to display firld with link

### Reusable UI : componentsedit fields

- use getEditFieldnumber to display numbers
- use getEditFieldDate to display dates
- use getEditField to display standard fields
- use AutocompleteSelector to allow the user to choose in a list
  - inside a form, field are identified by their id, not theirs names

### actions

- actions are responses to the events of the user.
- the actions are in the directory of the page they are related to.
- an action is in a directory, with the name actionActionName
- in the directory the file actionActionName.js is the action logic
- the main function is displayActionActionName
- an action can have/haven't a confirmation. If required, the confirmation use the confirmAction component

## Code Style

- ViewControllers must be **entirely dynamic**: HTML built via template strings, no hardcoded API data in controllers
- Data is fetched via appWSServices and injected dynamically
- Use **Bootstrap classes only** — no custom CSS
- All data tables must be wrapped for mobile scroll: `<div style="overflow-x: auto;"><table>...</table></div>`
- Prefer simple, readable code over clever solutions
- Small utility functions belong in `commonServices/`
- UI is bilingual (FR/EN) via `translationService.js` and locale files in `src/shared/assets/locales/`
  - error messages are displayed using the function displayAlert(alertType, message)
