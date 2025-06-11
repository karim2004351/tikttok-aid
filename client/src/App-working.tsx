import React from 'react';

export default function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e293b 0%, #7c3aed 50%, #1e293b 100%)',
      color: 'white',
      fontFamily: 'Cairo, Arial, sans-serif',
      direction: 'rtl',
      textAlign: 'right'
    }}>
      {/* Language Selector */}
      <div style={{ 
        position: 'fixed', 
        top: '1rem', 
        right: '1rem', 
        zIndex: 50,
        background: '#3b82f6',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        fontSize: '14px'
      }}>
        🇸🇦 العربية
      </div>

      {/* Header */}
      <header style={{ padding: '2rem', textAlign: 'center' }}>
        <nav style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          flexDirection: 'row-reverse'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexDirection: 'row-reverse' }}>
            <span style={{ fontSize: '2rem' }}>🌐</span>
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>منصة النشر الذكي متعددة المنصات</h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'row-reverse' }}>
            <a href="/contact" style={{ color: 'white', textDecoration: 'none' }}>تواصل معنا</a>
            <a 
              href="https://karimnapoli13.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                background: '#16a34a', 
                color: 'white', 
                padding: '0.5rem 1rem', 
                borderRadius: '0.5rem',
                textDecoration: 'none'
              }}
            >
              خدمات أخرى
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            background: '#7c3aed', 
            color: 'white', 
            padding: '0.5rem 2rem', 
            borderRadius: '2rem',
            display: 'inline-block',
            marginBottom: '2rem',
            fontSize: '1.1rem'
          }}>
            أكثر من 1,171 موقع ومنتدى متاح
          </div>
          
          <h2 style={{ 
            fontSize: 'clamp(2rem, 5vw, 4rem)', 
            marginBottom: '2rem', 
            background: 'linear-gradient(to right, white, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.2
          }}>
            انشر محتواك على العالم كله
          </h2>
          
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#d1d5db', 
            marginBottom: '3rem',
            lineHeight: 1.6,
            maxWidth: '600px',
            margin: '0 auto 3rem auto'
          }}>
            منصة النشر الذكي تمكنك من نشر فيديوهاتك ومحتواك على أكثر من 1100 موقع ومنتدى عالمي بضغطة واحدة. وصل إلى ملايين المشاهدين حول العالم.
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            flexDirection: 'row-reverse'
          }}>
            <a 
              href="/free-publish"
              style={{ 
                background: '#3b82f6', 
                color: 'white', 
                padding: '1rem 2rem', 
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                transition: 'background 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = '#2563eb'}
              onMouseOut={(e) => e.target.style.background = '#3b82f6'}
            >
              انشر مجاناً الآن
            </a>
            <a 
              href="/contact"
              style={{ 
                border: '2px solid white', 
                color: 'white', 
                background: 'transparent',
                padding: '1rem 2rem', 
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#1e293b';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'white';
              }}
            >
              تواصل معنا
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ 
            fontSize: '2.5rem', 
            textAlign: 'center', 
            marginBottom: '3rem',
            color: 'white'
          }}>
            لماذا منصة النشر الذكي؟
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem'
          }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem', 
              padding: '2rem', 
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
              <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>تغطية عالمية شاملة</h4>
              <p style={{ color: '#d1d5db', lineHeight: 1.6 }}>
                أكثر من 1,171 موقع ومنتدى من جميع أنحاء العالم
              </p>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem', 
              padding: '2rem', 
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>نشر سريع وذكي</h4>
              <p style={{ color: '#d1d5db', lineHeight: 1.6 }}>
                اتمتة كاملة لعملية النشر مع متابعة مباشرة
              </p>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem', 
              padding: '2rem', 
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>أمان وموثوقية</h4>
              <p style={{ color: '#d1d5db', lineHeight: 1.6 }}>
                نشر آمن مع حماية كاملة لبياناتك
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '4rem 2rem', 
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ 
            fontSize: '2rem', 
            marginBottom: '1rem',
            color: 'white'
          }}>
            ابدأ النشر الآن
          </h3>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#d1d5db', 
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            انضم إلى آلاف المستخدمين الذين يثقون بمنصتنا لنشر محتواهم على العالم
          </p>
          <a 
            href="/free-publish"
            style={{ 
              background: '#16a34a', 
              color: 'white', 
              padding: '1.2rem 3rem', 
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              display: 'inline-block',
              transition: 'background 0.3s'
            }}
            onMouseOver={(e) => e.target.style.background = '#15803d'}
            onMouseOut={(e) => e.target.style.background = '#16a34a'}
          >
            ابدأ الآن مجاناً
          </a>
        </div>
      </section>
    </div>
  );
}