# Site Selection Ballot

In order to generate a Worldcon Site Selection ballot that's customised for each member, you need a PDF version of the ballot with a fillable form. Furthermore, you need to define a mapping of the user data to the form fields. These will used by [pdf-form-fill](https://github.com/eemeli/pdf-form-fill#readme) to produce a PDF ballot.

The sample `ballot.pdf` and `ballot-data.js` correspond to what was used by Worldcon 75 in the site selection for the 2019 Worldcon. Once you generate your own PDF form, you'll want to modify `ballot-data.js` to match the fields used in your PDF, and to update the metadata to correspond to your own convention. Note that check marks will likely require `true` to be represented as `"Yes"` and `false` as `"No"`.
