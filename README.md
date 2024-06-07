# Tidy Text

An extension for [Owlbear Rodeo](https://www.owlbear.rodeo/) to allow
toggling the visibility of image labels.

![Interface Demo](./docs/demo.gif)

## Usage

With the tool selected, clicking on an object (prop, character, etc.)
either hides an existing label or restores a hidden label.

The extension also includes "hide all" and "show all" buttons that can be
used while the tool is active.

If new text is added to an object that already has hidden text, the texts
are concatenated on hide/show to avoid losing any data.

## Development

To install dependencies run:

`npm install`

To run in development mode run:

`npm run dev`

To build for deployment run:

`npm run build`

## License

MIT
