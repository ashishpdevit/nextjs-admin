import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Get the image path from the URL
    const imagePath = params.path.join('/')
    
    // Construct the full URL to the image server
    const imageUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000'}/images/${imagePath}`
    
    // Fetch the image from the image server
    const imageResponse = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
      },
    })

    if (!imageResponse.ok) {
      return new NextResponse('Image not found', { status: 404 })
    }

    // Get the image data
    const imageBuffer = await imageResponse.arrayBuffer()
    
    // Get the content type from the response
    const contentType = imageResponse.headers.get('content-type') || 'image/png'
    
    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    return new NextResponse('Error loading image', { status: 500 })
  }
}

