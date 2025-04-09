import { Home, Combine, Network, MapPin, CheckCircle } from "lucide-react";

export default function Properties() {
  const roadManagementItems = [
    "Grading and maintaining shared road easements",
    "Installation and upkeep of signage and safety features",
    "Coordinating with repair services for access and fee negotiation",
    "Maintaining legal road access agreements for non-property users",
    "Pursuing legal action for unpaid dues",
  ];

  return (
    <section id="properties" className="py-16 bg-[#F5F5DC] bg-opacity-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#2C5E1A] pt-6">
          Our Properties
        </h2>
        <p className="text-center max-w-3xl mx-auto mb-12">
          Riverwood Ranch encompasses 36 unique properties connected by our
          shared road network. Below is information about our community and road
          easement management.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="rounded-lg overflow-hidden shadow-lg mb-6">
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                alt="Aerial view of Riverwood Ranch properties"
                className="w-full h-64 object-cover"
              />
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-[#8B5A2B]">
              Property Overview
            </h3>

            <div className="space-y-4">
              <div className="flex items-start">
                <Home className="text-[#2C5E1A] mt-1 mr-3" size={20} />
                <div>
                  <h4 className="font-medium">Property Types</h4>
                  <p className="text-sm">
                    Our community includes a diverse mix of ranch homes,
                    single-family residences, and larger estate properties, all
                    maintaining the natural character of the area.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Combine className="text-[#2C5E1A] mt-1 mr-3" size={20} />
                <div>
                  <h4 className="font-medium">Property Sizes</h4>
                  <p className="text-sm">
                    Properties range from 2-acre parcels to 5+ acre estates,
                    offering both privacy and a sense of community within our
                    ranch boundaries.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Network className="text-[#2C5E1A] mt-1 mr-3" size={20} />
                <div>
                  <h4 className="font-medium">Natural Features</h4>
                  <p className="text-sm">
                    Many properties feature natural landscapes including oak
                    groves, seasonal streams, and rolling hills with views of
                    the surrounding mountains.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="text-[#2C5E1A] mt-1 mr-3" size={20} />
                <div>
                  <h4 className="font-medium">Location Benefits</h4>
                  <p className="text-sm">
                    While enjoying the secluded feel of country living,
                    residents are just a short drive from Los Angeles amenities,
                    including shopping, dining, and entertainment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4 text-[#2C5E1A]">
                Road Easement Management
              </h3>
              <p className="mb-4">
                Our corporation maintains the private road network serving all
                36 properties. Responsibilities include:
              </p>

              <ul className="space-y-3 mb-6">
                {roadManagementItems.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle
                      className="text-[#2C5E1A] mt-1 mr-2"
                      size={16}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="text-sm text-gray-600 italic">
                NOTE: All property owners are legally required to pay annual
                dues to the Riverwood Ranch Corporation. These dues are used to
                cover the costs of maintaining the shared road easement and
                other community amenities. Failure to pay dues may result in
                legal action. These due obligations are outlined in the official
                Ranch Bylaws available in the Records section of this website.
                Annual dues are based on projected expenses and are approved by
                a vote of ranch members.
              </p>
            </div>

            <div className="rounded-lg overflow-hidden shadow-md">
              <div className="aspect-w-16 aspect-h-9 h-64">
                <iframe
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d13269.327635490083!2d-118.3186442!3d34.2770449!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1712267900000!5m2!1sen!2sus"
                  title="Map of Riverwood Ranch location"
                  className="w-full h-full"
                />
              </div>
              <div className="bg-[#2C5E1A] text-white p-4">
                <h4 className="font-semibold mb-1">Riverwood Ranch Location</h4>
                <p className="text-sm">
                  Located in the hills of Los Angeles, California. For specific
                  directions, please contact the board.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
