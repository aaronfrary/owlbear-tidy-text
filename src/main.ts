import OBR, { TextContent, Image, isImage, buildLabel } from "@owlbear-rodeo/sdk"

/**
 * This file represents the background script run when the plugin loads.
 * It creates the tool and associated modes and actions.
 */

interface ItemMetadata {
  tidytext?: TextContent
}

// Get the reverse domain name id for this plugin at a given path
function getPluginId(path: string) {
  return `rodeo.owlbear.tidy-text/${path}`
}

// Create a blank TextContent object
function generateBlankTextContent() {
  return buildLabel().build().text
}

// Save and hide existing text
function stowImageText(items: Image[]) {
  for (let item of items) {
    if (item.text.plainText) {
      item.metadata[getPluginId('metadata')] = { tidytext: item.text }
      item.text = generateBlankTextContent()
    }
  }
}

// Show previously hidden text
function restoreImageText(items: Image[]) {
  const id = getPluginId('metadata')
  for (let item of items) {
    const metadata = item.metadata[id] as ItemMetadata | undefined
    const hiddenText = metadata?.tidytext
    if (hiddenText) {
      item.metadata[id] = { tidytext: undefined }
      item.text = hiddenText
    }
  }
}

function createTool() {
  OBR.tool.create({
    id: getPluginId("tool"),
    icons: [
      {
        icon: "/note.svg",
        label: "Toggle Image Labels",
      },
    ],
  })
}

function createMode() {
  OBR.tool.createMode({
    id: getPluginId("mode"),
    icons: [
      {
        icon: "/note.svg",
        label: "Toggle Image Label",
        filter: {
          activeTools: [getPluginId("tool")],
        },
      },
    ],
    cursors: [
      {
        cursor: "pointer",
        filter: {
          target: [
            { key: "visible", value: true },
            { key: "type", value: "IMAGE" },
            { key: "layer", value: "MAP", operator: "!=" },
          ]
        }
      }
    ],
    async onToolClick(_context, event) {
      const { target } = event
      if (target && isImage(target)) {
        // Toggle image text
        if (target.text.plainText) {
          OBR.scene.items.updateItems([target], stowImageText)
        } else {
          OBR.scene.items.updateItems([target], restoreImageText)
        }
      }
    }
  })
}

function createActionHideAll() {
  OBR.tool.createAction({
    id: getPluginId("action-hide-all"),
    icons: [
      {
        icon: "/hide.svg",
        label: "Hide All",
        filter: {
          activeTools: [getPluginId("tool")],
        },
      },
    ],
    async onClick(_context, _elementId) {
      OBR.scene.items.updateItems(isImage, stowImageText)
    }
  })
}

function createActionShowAll() {
  OBR.tool.createAction({
    id: getPluginId("action-show-all"),
    icons: [
      {
        icon: "/show.svg",
        label: "Show All",
        filter: {
          activeTools: [getPluginId("tool")],
        },
      },
    ],
    async onClick(_context, _elementId) {
      OBR.scene.items.updateItems(isImage, restoreImageText)
    }
  })
}

OBR.onReady(() => {
  createTool()
  createMode()
  createActionShowAll()
  createActionHideAll()
})
