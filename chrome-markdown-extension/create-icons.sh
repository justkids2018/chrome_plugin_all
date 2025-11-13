#!/bin/bash
# Create simple placeholder icons for the extension

cd "${0%/*}/icons"

# Create a simple 16x16 blue icon (placeholder)
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\x08\x06\x00\x00\x00\x1f\xf3\xffa\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\xc9e<\x00\x00\x01\x84iTXtXML:com.adobe.xmp\x00\x00\x00\x00\x00< xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="XMP Core 4.4.0" >\n <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\n  <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmlns:xmpMM="http://ns.adobe.com/xap/1.0/mm/" xmlns:stRef="http://ns.adobe.com/xap/1.0/sType/ResourceRef#" xmp:CreatorTool="Adobe Photoshop CS6 (Macintosh)" xmpMM:InstanceID="xmp.iid:8BAB433ABA0D11E2B48CFEB13C7C7B62" xmpMM:DocumentID="xmp.did:8BAB433ABA0D11E2B48CFEB13C7C7B62">\n   <xmpMM:DerivedFrom stRef:instanceID="xmp.iid:89BAB433ABA0D11E2B48CFEB13C7C7B62" stRef:documentID="xmp.did:89BAB433ABA0D11E2B48CFEB13C7C7B62"/>\n  </rdf:Description>\n </rdf:RDF>\n</xmpmeta>\n\x00\x00\x00\x1atIME\x07\xe2\x0c\x13\x11\'\x10\x05\x1d\x00\x00\x00 IDATx\x9c\x95\x92\x91\x0e\xc0 \x08\x04\x9f\xe9\xcev\xedxw\x90\xdc\xdeI\xf7}\x0e\n\xc1\xb9\xa2y\xc7p\xdc\xb9jI\'v\xb4\xfd\x1c\xed\xed\x1f\x04\x93\xd2\xca5;\xa6\x81R\xb9\xb6\xdb\xefj\x9a\x9d.\x93\x93\xbd\xf6\x7fA`\xea\xb5\xf5\xb8\xdeZ\xb41\x95Y\xf7n\xdf\xb0\xfb\xb9\xf4\xc5\xfbhv\xdeg\xcbL\xc8N\xf9\xef\xc3\xc3\xcb/\x9e\xc9<\xbf\xb5E\xb2\x9cTM\xe7\x95s.\x9a\xe7V\x9dM\xdcB\xf2\xbb\x9e\xa4s\x01]\x04\x9d\x97\xb0\xcd> Gi\xdb#G\x02e\x01\xe8\xb8\x8d]\xf8O\xfba\xe88\x9cg~spr\xd8-\x93e\xdc\\r\xf3\xbb>\x85\xd7\xb8\x07\xe8\xe6kEC\x07\x00\x00\x00%tEXtdate:create\x002023-12-19T17:39:13+08:00\x00\x00\x00%tEXtdate:modify\x002023-12-19T17:39:13+08:00\x9ez%\x00\x00\x00::xTExtXML:com.adobe.xmp\x00\x00\x00\x00\x00<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="XMP Core 4.4.0">\n <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\n  <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmlns:xmpMM="http://ns.adobe.com/xap/1.0/mm/" xmlns:stRef="http://ns.adobe.com/xap/1.0/sType/ResourceRef#" xmp:CreatorTool="Adobe Photoshop CS6 (Macintosh)" xmpMM:InstanceID="xmp.iid:8BAB433ABA0D11E2B48CFEB13C7C7B62" xmpMM:DocumentID="xmp.did:8BAB433ABA0D11E2B48CFEB13C7C7B62">\n   <xmpMM:DerivedFrom stRef:instanceID="xmp.iid:89BAB433ABA0D11E2B48CFEB13C7C7B62" stRef:documentID="xmp.did:89BAB433ABA0D11E2B48CFEB13C7C7B62"/>\n  </rdf:Description>\n </rdf:RDF>\n</x:xmpmeta>\n\x00\x00\x00\x00IEND\xaeB`\x82' > icon16.png

# Copy to create other sizes
for size in 32 48 128; do
    cp icon16.png icon${size}.png
done

echo "✅ Icons created successfully!"
echo "If icons don't display properly, consider using ImageMagick:"
echo "  convert -resize 16x16 icon-source.png icon16.png"
echo "  convert -resize 32x32 icon-source.png icon32.png"
echo "  convert -resize 48x48 icon-source.png icon48.png"
echo "  convert -resize 128x128 icon-source.png icon128.png"