## Development Notes

The compiler should do as much work in parallel as possible

The phases are:

- Generate a list of all input files (glob)
- Read single file from list
	- process markdown
	- Read template
	- write output
	- garbage collect junk
	- signal file when ready
- When all files form the list are ready
	- signal all files ready