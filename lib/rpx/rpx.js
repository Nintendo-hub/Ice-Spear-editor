/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*
* Special Thanks to:
* @see https://github.com/Relys/rpl2elf
*/

const fs = require('fs');
const Binary_File = require('binary-file');
const pakoZlib = require('pako');

/**
 * What a time to be alive, parsing out ELF like executables with Javascript
 * Parses very basic section data
 */
module.exports = class RPX
{
    constructor()
    {        
        this.SHT_NULL     = 0x00000000;
        this.SHT_PROGBITS = 0x00000001;
        this.SHT_SYMTAB   = 0x00000002;
        this.SHT_STRTAB   = 0x00000003;
        this.SHT_RELA     = 0x00000004;
        this.SHT_HASH     = 0x00000005;
        this.SHT_DYNAMIC  = 0x00000006;
        this.SHT_NOTE     = 0x00000007;
        this.SHT_NOBITS   = 0x00000008;
        this.SHT_REL      = 0x00000009;
        this.SHT_SHLIB    = 0x0000000A;
        this.SHT_DYNSYM   = 0x0000000B;

        this.SHT_INIT_ARRAY    = 0x0000000E;
        this.SHT_FINI_ARRAY    = 0x0000000F;
        this.SHT_PREINIT_ARRAY = 0x00000010;
    
        this.SHT_HIPROC     = 0x7FFFFFFF;
        this.SHT_HIUSER     = 0xFFFFFFFF;        
        this.SHT_LOPROC     = 0x70000000;
        this.SHT_LOUSER     = 0x80000000;

        this.SHF_RPL_ZLIB     = 0x08000000;
        this.SHT_RPL_EXPORTS  = 0x80000001;
        this.SHT_RPL_IMPORTS  = 0x80000002;
        this.SHT_RPL_CRCS     = 0x80000003;
        this.SHT_RPL_FILEINFO = 0x80000004;
    }

    /**
     * parses a RPX file and it's section
     * at this point no data is decompressed
     * @param {String} elfFile 
     */
    parse(elfFile)
    {
        this.parser = new Binary_File.Parser(elfFile);
        this.file = this.parser.file;
        this.file.setEndian("big");

        this.header = this.parser.parse(require("./header.json"));

        for(let section of this.header.sections)
        {
            if(section.offset != 0)
            {
                /*
                this.file.pos(section.offset);

                if((section.type & this.SHT_RPL_FILEINFO) == this.SHT_RPL_FILEINFO)
                {
                    section.fileInfo = this.parser.parse(require("./file_info_section.json"));
                }
                */
                this.file.pos(section.offset);

                if((section.type & this.SHT_NOBITS) != this.SHT_NOBITS)
                {
                    section.compressed = (section.flags & this.SHF_RPL_ZLIB) == this.SHF_RPL_ZLIB;

                    if(section.compressed)
                    {
                        section.realSize = this.file.read("u32");
                        section.flags &= ~this.SHF_RPL_ZLIB;
                    }
                    
                    let dataOffset = this.file.pos();
                    section.bufferRaw = this.file.buffer.slice(dataOffset, dataOffset + section.size);

                    if(!section.compressed)
                        section.buffer = section.bufferRaw;
                }
            }
        }
    }

    /**
     * decompresses a section and adds the data to the section object
     * @param {Object} section 
     */
    _decompressSection(section)
    {
        if(section.compressed && section.buffer == null)
        {
            try {
                section.buffer = pakoZlib.inflate(section.bufferRaw);
    
                if(section.buffer.length != section.realSize)
                    console.warn("RPX: compressed buffer has wrong size!");
    
            }catch(err)
            {
                console.warn("RPX: " + err);
            }
        }
    }

    /**
     * returns an array with all section data (decompressed) that matches the given type
     * @param {Int} type type to filter by
     * @returns array of section data
     */
    getSectionData(type = null)
    {
        let sectionData = [];

        for(let section of this.header.sections)
        {
            if(section.offset != 0 && (type === null || section.type == type))
            {
                this._decompressSection(section);

                if(section.buffer != null)
                    sectionData.push(section.buffer);
            }
        }

        return sectionData;
    }
};