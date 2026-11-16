A solid accent button for the one main action on a screen, with a ghost variant for everything else.

Use `gd-btn` for the primary action and `gd-btn gd-btn--ghost` for secondary ones. The label states what happens: "Start your running journey", "Send on WhatsApp", "Copy message".

- Provide a link (`<a>`) for navigation and a `<button>` for actions. Keep the label under about 30 characters.
- One primary per screen. Two primaries compete; make the second one ghost.
- On the `ink` call-to-action band the ghost button takes `bg` for its text and border.
- Text is `accent-ink` on `accent`; do not use literal white. The focus ring is a 3px `river` outline.
