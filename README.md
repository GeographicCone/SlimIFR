# IfrFmt – Internal Form Representation Formatting Script

## The What

This script makes it easier to browse and read an _IFR Extractor_ dump.

###  Features

* Only one row per entry for better clarity
* Redundant and unimportant output eliminated
* Much more concise (size reduced by over 80%)
* Hexadecimal values padded to align with one another
* Settings sorted alphabetically by `VarStore`
* Easily customizable if need be

### Comparison

|           |  IFR Extractor Verbose | IFR Extractor  |  IfrFmt  |
|----------:|-----------------------:|---------------:|---------:|
| File Size | 3MB                    | 2MB            | 500 kB   |
| # of Rows | 33,479                 | 33,479         | 4,604    |

### Example

````
AMITSESetup:0x0040               Boot: Quiet Boot [0x00 / 0x01]
MeSetup:0x0003                   Firmware Update Configuration: Me FW Image Re-Flash [0x00 - Disabled, 0x01 - Enabled]
SaSetup:0x000F(0x02)             Memory Overclocking Menu: tREFI [0x0000 - 0xFFFF]
````

<details>
<summary>Instead of…</summary>

````
		CheckBox Prompt: "Quiet Boot", Help: "Enables or disables Quiet Boot option", QuestionFlags: 0x0, QuestionId: 0x106E, VarStoreId: 0xF013, VarOffset: 0x40, Flags: 0x0, Default: Disabled, MfgDefault: Disabled
			Default DefaultId: 0x0 Value: 1
			Default DefaultId: 0x1 Value: 1
		End 
````

````
	Form FormId: 0x27DA, Title: "Firmware Update Configuration"
		OneOf Prompt: "Me FW Image Re-Flash", Help: "Enable/Disable Me FW Image Re-Flash function.", QuestionFlags: 0x10, QuestionId: 0x2A0, VarStoreId: 0x9, VarOffset: 0x3, Flags: 0x10, Size: 8, Min: 0x0, Max: 0x1, Step: 0x0
			OneOfOption Option: "Disabled" Value: 0, Default, MfgDefault
			OneOfOption Option: "Enabled" Value: 1
		End 
````

````
			Numeric Prompt: "  tREFI", Help: "Refresh Interval, 0: AUTO, max: 65535", QuestionFlags: 0x14, QuestionId: 0x2773, VarStoreId: 0x5, VarOffset: 0xF, Flags: 0x11, Size: 16, Min: 0x0, Max: 0xFFFF, Step: 0x1
				Default DefaultId: 0x0 Value: 0
			End 
````
</details>

Also see:
* [Example-Input.txt](https://github.com/GeographicCone/IfrFmt/blob/master/Example-Input.txt)…
* …and [Example-Output.txt](https://github.com/GeographicCone/IfrFmt/blob/master/Example-Output.txt)

## The How

### Prepare

* UEFI (BIOS) image to explore
* [UEFITool](https://github.com/LongSoft/UEFITool/) or another utility to extract the `Setup` module from the image
* [IFR Extractor](https://github.com/LongSoft/IFRExtractor-RS) to extract the _IFR_ data from the `Setup` module
* [Node.js](https://nodejs.org/en/download) to run the script (`wget https://nodejs.org/dist/v18.17.1/win-x64/node.exe`)

### Run

* `UEFIExtract Image.bin 899407D7-99FE-43D8-9A21-79EC328CAC21 -m file -o Setup.efi` to extract the `Setup` module
* `IFRExtractor Setup.efi verbose` to extract the IFR data
* `node IfrFmt.js Setup.efi.0.0.en-US.ifr.txt IFR.txt` (the parameters are simply: `<InputFilename> <OutputFilename>`)

### Use

* Browse with a good editor such as [Notepad++](https://notepad-plus-plus.org/downloads/)
* Change these settings with [setup_var.efi](https://github.com/datasone/setup_var.efi)

## The Why

Most of the available _UEFI (BIOS) Setup_ settings on any given platform are typically hidden from the user. Extracting the _Internal Form Representation (IFR)_ data from a firmware image makes it possible to see them all. Other tools can then be used to modify these settings.

The IFR data is stored as a blob within the `Setup` or `SetupUtility` EFI module. A tool to dump it in a human-readable form was first written by [Donovan6000](https://github.com/donovan6000/Universal-IFR-Extractor). More recently, a rewritten and updated version has been maintained by [LongSoft](https://github.com/LongSoft/UEFITool/). The verbose output provided by these tools is essential for some use cases but can be suboptimal for quickly just browsing through.

Enter **IfrFmt**.

## Credits

This tool is based on [IFR-Formatter](https://github.com/BoringBoredom/UEFI-Editor/blob/master/IFR-Formatter/IFR-Formatter.js) by [**BoringBoredom**](https://github.com/BoringBoredom/), although the output format is completely different.
