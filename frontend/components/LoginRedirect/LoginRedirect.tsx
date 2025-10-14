import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

type LoginRedirectProps = {
  handleLogin: () => void
}

export function LoginRedirect({ handleLogin }: LoginRedirectProps) {

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Se connecter</CardTitle>
          <CardDescription>
            Connectez-vous avec votre compte AWS Cognito pour accéder à l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
          onClick={handleLogin}
          className="w-full cursor-pointer"
          size="lg"
          >
            Se connecter avec AWS Cognito
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Vous serez redirigé vers la page de connexion AWS Cognito
          </p>
        </CardContent>
      </Card>
    </div>
  )
}