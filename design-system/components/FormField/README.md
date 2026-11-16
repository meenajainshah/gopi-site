A labelled form field with an optional hint, for the enquiry form and the share pages.

Provide a visible `<label for>`, an input with a stable `id`, and a hint of one sentence. Inputs have a `muted` border (not `line`) so the control meets 3:1 against its ground.

- Set `maxlength` where the data has a limit (a share-card name is 40 characters).
- Show an error as one plain sentence in `accent` under the field, with `role="alert"`.
