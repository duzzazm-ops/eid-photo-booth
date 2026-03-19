Redesign and complete the Eid Photo Booth website as a polished, premium, human-crafted product. The final result must feel like it was designed by a senior UX/UI designer with more than 20 years of experience, not by an AI tool or based on generic templates.

This is a bilingual web app for Eid photo capture, and it must support both Arabic and English with a mobile-first responsive experience.

Main Goal

Create a beautiful, festive, elegant Eid photo booth website where users can:
	1.	choose a capture mode
	2.	choose a frame
	3.	open the camera
	4.	see the selected frame live on top of the camera preview
	5.	take either one photo or four photos
	6.	preview the result
	7.	download the final image without storing anything on a server

Overall Visual Direction

The current design feels too artificial and templated. Redesign the entire interface to feel intentional, refined, and professionally art-directed.

The style should be:
	•	festive
	•	elegant
	•	warm
	•	joyful
	•	premium
	•	soft and refined
	•	clearly human-designed

Avoid:
	•	generic AI-looking layouts
	•	overly bold red/black nightclub style
	•	harsh contrast
	•	random gradients
	•	cheap-looking icons
	•	emoji-style decorations
	•	oversized buttons
	•	template-like card layouts
	•	anything that looks auto-generated

Color Palette

Use a joyful but elegant Eid palette with soft celebratory tones, for example:
	•	Cream / warm off-white
	•	Soft pastel green
	•	Soft sky blue
	•	Light blush pink
	•	Warm gold accents
	•	Soft charcoal or dark grey only for text

The interface should feel light, festive, and polished. The colorful energy should mainly come from the frames and selected accents, while the site itself stays clean and balanced.

Typography

Choose typography carefully so the website feels editorial and premium, not default.

Use:
	•	Arabic: IBM Plex Sans Arabic, Cairo, or another refined Arabic typeface
	•	English headings: Playfair Display or another elegant serif
	•	English body text: Inter or a clean modern sans-serif

Typography must feel balanced between Arabic and English. Font sizes, spacing, and hierarchy should be thoughtful and polished.

Product Structure

The website must contain these screens and flows:

1. Landing / Welcome Screen

This is the first screen the user sees.

It should include:
	•	a beautiful and elegant intro section
	•	clear bilingual title
	•	a short friendly subtitle
	•	a preview of the Eid frames or sample output
	•	a primary CTA button to start

Possible title examples:
	•	Eid Photo Booth
	•	عيد سعيد
	•	Capture Your Eid Moments
	•	وثّق فرحة العيد

This screen should feel refined and inviting, not crowded.

2. Capture Mode Selection Screen

Before selecting frames, the user must choose the photo style.

There must be two capture modes:

Option A: Single Photo
	•	user takes one photo only
	•	final output uses one frame
	•	suitable for individual, family, or group photos

Option B: Photo Strip
	•	user takes four photos in sequence
	•	final output appears in a vertical strip frame
	•	suitable for classic photo booth experience

The mode selection UI should be very clear and visually elegant.
Each option should have:
	•	title
	•	short description
	•	preview thumbnail or sample result

The layout must feel premium and simple, not like a generic settings screen.

3. Frame Selection Screen

After choosing the capture mode, the user goes to frame selection.

Requirements:
	•	show real previews of my uploaded PNG frames
	•	do not redesign the frames
	•	use the exact provided transparent PNG frame assets
	•	display them as clean selectable previews
	•	users should clearly understand what each frame looks like before opening the camera

Important:
	•	only show frames that match the selected mode
	•	if the user selected Single Photo mode, show only single-photo frames
	•	if the user selected Photo Strip mode, show only strip frames

Frame previews should look elegant and curated.
Do not show color circles or fake placeholders.
Show actual frame images.

4. Camera Experience

This is one of the most important parts of the project.

When the user selects a frame and opens the camera:

Live Camera Requirements
	•	the camera must open directly inside a clean, focused capture screen
	•	the selected frame must appear live on top of the camera preview as an overlay
	•	the user must see exactly how the final photo will look before capturing
	•	the frame overlay must remain fixed and visible during the entire camera session

This is critical:
the frame must be visible while the camera is open, not only after capture

Camera Layout

The camera screen should include:
	•	live camera preview
	•	selected frame overlay on top of the camera
	•	capture button
	•	close/back button
	•	switch camera option if possible (front/back on mobile)
	•	timer selection
	•	minimal controls only
	•	clean and premium interface with no clutter

Timer Options

Include timer options such as:
	•	3 seconds
	•	5 seconds
	•	10 seconds

The selected timer should be visually clear but subtle.

Camera Behavior by Mode

Single Photo Mode
	•	show live camera
	•	show chosen single-photo frame overlay
	•	when the user captures, take one image only
	•	the final image must fit correctly inside the selected frame

Photo Strip Mode
	•	show live camera
	•	show the chosen strip frame overlay or a guided preview
	•	capture 4 photos in sequence automatically
	•	before each photo, show a visible countdown
	•	place each photo into the correct section of the strip
	•	final output should look like a real photo booth strip

5. Frame Placement and Photo Area

Use my provided transparent PNG frames exactly as they are.

Do not redesign the frames and do not force all of them into one fake identical layout.

Instead:
	•	read each frame’s dimensions correctly
	•	preserve each frame proportion
	•	support different frame shapes and formats
	•	place the camera/photo only inside the valid inner photo area for each frame

Each frame has its own custom photo area.
The image must fit inside that area only.

Important technical behavior:
	•	no stretching
	•	no distortion
	•	no incorrect scaling
	•	use cover-style crop where needed
	•	photo must look naturally placed inside the frame

Some frames are:
	•	square-ish
	•	portrait
	•	landscape
	•	vertical strip

The camera preview should adapt to the selected frame ratio and inner photo area as much as possible.

6. Responsive Mobile Experience

This product must be designed mobile-first.

Requirements:
	•	works beautifully on phones
	•	frame overlay scales correctly on small screens
	•	capture button stays accessible
	•	no important UI gets hidden behind browser bars
	•	text and buttons remain clean and readable
	•	layout should adapt smoothly between phone and tablet sizes

The camera experience should feel natural and polished on mobile devices.

7. Capture Feedback and Micro-Interactions

To make the experience feel premium and professionally designed, include subtle interaction details:
	•	smooth transitions between screens
	•	subtle button hover/tap states
	•	elegant countdown animation before each shot
	•	optional flash effect on capture
	•	optional soft shutter animation
	•	clean loading/processing state after capture
	•	subtle selection state for chosen frame

These details should be understated, not flashy.

8. Preview / Result Screen

After capture, the user must see a refined preview screen.

Requirements:
	•	show the final output clearly
	•	support both single photo result and photo strip result
	•	keep the layout minimal and elegant
	•	allow the user to:
	•	download
	•	retake
	•	go back if needed

The preview screen should feel calm and premium.
Do not overload it with effects.

9. Privacy and Output Rules

This website must be privacy-friendly.

Requirements:
	•	no backend storage
	•	do not save photos to a server
	•	photos only exist during the session unless the user downloads them
	•	final output should be downloadable directly to the device

Make this behavior clear in implementation.

10. Bilingual Support

The full experience must support both:
	•	Arabic
	•	English

Requirements:
	•	proper RTL support for Arabic
	•	clean mirrored layout where appropriate
	•	language switch should feel intentional and polished
	•	Arabic and English typography must both look well designed
	•	no awkward alignment issues

11. Content Tone

The website should feel celebratory, warm, and tasteful.
The copy should be short, elegant, and human.

Avoid robotic copywriting.
Avoid placeholder text that feels AI-generated.

12. Design Principles

Use these principles consistently:
	•	clarity
	•	spacing
	•	restraint
	•	elegance
	•	hierarchy
	•	craftsmanship
	•	visual balance
	•	warm festive feeling

The design should look like a premium boutique seasonal experience, not a generic app builder result.

13. Important Non-Negotiable Rules
	•	Do not redesign my frame assets
	•	Use my transparent PNG frames exactly as provided
	•	The selected frame must be visible live while the camera is open
	•	The final photo must fit correctly inside the frame
	•	Support both single-photo mode and four-photo strip mode
	•	Design the whole site in a premium, clearly human-crafted way
	•	Avoid any look that feels obviously AI-generated

14. Technical Guidance

Build the product so it can be implemented with:
	•	React or Next.js
	•	WebRTC / getUserMedia for camera access
	•	Canvas-based export for final merged image
	•	Mobile-first responsive behavior

Use the uploaded frame assets directly as overlay images.

⸻

Extra instruction for the tool:
Please redesign the current interface completely and elevate the overall art direction, layout quality, typography, spacing, component styling, and camera flow so the final result looks handcrafted, premium, festive, and production-ready.
