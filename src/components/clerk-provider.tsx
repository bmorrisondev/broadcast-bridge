import { ClerkProvider as ClerkNextJSProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/themes';

type ClerkProviderProps = React.ComponentProps<typeof ClerkNextJSProvider>;

export function ClerkProvider({ children, appearance, ...props }: ClerkProviderProps) {
  return (
    <ClerkNextJSProvider
      appearance={{
        theme: shadcn,
        // Default retro-friendly variables mapped from app CSS vars
        variables: {
          colorBackground: 'var(--popover)',
          colorText: 'var(--foreground)',
          colorPrimary: 'var(--primary)',
          colorDanger: 'var(--destructive)',
          colorInputBackground: 'var(--card)',
          colorInputText: 'var(--foreground)',
          colorShimmer: 'var(--muted)',
          fontFamily: 'var(--font-sans)',
          borderRadius: 'var(--clerk-border-radius)'
        },
        // Allow incoming appearance to override any of the above
        ...(appearance ? { ...appearance, variables: { 
          colorBackground: 'var(--popover)',
          colorText: 'var(--foreground)',
          colorPrimary: 'var(--primary)',
          colorDanger: 'var(--destructive)',
          colorInputBackground: 'var(--card)',
          colorInputText: 'var(--foreground)',
          colorShimmer: 'var(--muted)',
          fontFamily: 'var(--font-sans)',
          borderRadius: 'var(--clerk-border-radius)',
          ...(appearance.variables || {})
        } } : {}),
      }}
      {...props}
    >
      {children}
    </ClerkNextJSProvider>
  );
}
